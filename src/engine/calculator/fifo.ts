import type { Transaction, Lot, TaxableEvent, TaxSummary } from '../../types';
import type { PriceMap } from '../prices';
import { toEURWithPrices } from '../prices';

const FIAT_AND_STABLES = new Set([
  'EUR', 'USD', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY',
  'USDT', 'USDC', 'BUSD', 'TUSD', 'DAI', 'FDUSD', 'GUSD', 'USDP',
]);

function isFiatOrStable(asset: string): boolean {
  return FIAT_AND_STABLES.has(asset.toUpperCase());
}

/**
 * French Crypto Tax Calculator
 *
 * Implements the EXACT formula from Article 150 VH bis du CGI :
 *
 *   PV = (PC - Frais) - PA × (PC - Frais) / VG
 *
 * Where:
 *   PC  = Prix de cession (sale proceeds)
 *   PA  = Prix total d'acquisition NET du portefeuille (running total, decremented after each sale)
 *   VG  = Valeur globale du portefeuille au moment de la cession (market value)
 *   PV  = Plus-value ou moins-value
 *
 * IMPORTANT: This is NOT a per-asset FIFO. The PA is a GLOBAL running total
 * across ALL crypto assets. Each sale "consumes" a fraction of PA proportional
 * to the ratio (cession / portfolio value).
 *
 * Source: BOFIP BOI-RPPM-PVBMC-30-20
 */
export class FIFOCalculator {
  private lots: Map<string, Lot[]> = new Map(); // Track quantities per asset
  private events: TaxableEvent[] = [];
  private lotIdCounter = 0;
  private prices: PriceMap = new Map();

  // PA = Prix total d'acquisition net (running total)
  // Incremented on buys, decremented on sells (by the allocated fraction)
  private totalAcquisitionCost = 0;

  calculate(transactions: Transaction[], prices?: PriceMap): { events: TaxableEvent[]; lots: Map<string, Lot[]> } {
    this.prices = prices ?? new Map();
    const sorted = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());

    this.lots = new Map();
    this.events = [];
    this.lotIdCounter = 0;
    this.totalAcquisitionCost = 0;

    for (const tx of sorted) {
      this.processTransaction(tx);
    }

    return { events: this.events, lots: this.lots };
  }

  private processTransaction(tx: Transaction): void {
    switch (tx.type) {
      case 'buy':
        this.handleBuy(tx);
        break;
      case 'sell':
        this.handleSell(tx);
        break;
      case 'swap':
        this.handleSell(tx);
        this.handleBuy(tx);
        break;
      case 'staking_reward':
      case 'airdrop':
        // Cost basis = 0 (simplified — see legal note below)
        // ATTENTION: staking rewards may be taxable as BNC at reception
        this.addLot(tx.receivedAsset, tx.receivedAmount, 0, tx.date, tx.exchange);
        // PA is NOT incremented (cost = 0)
        break;
    }
  }

  private handleBuy(tx: Transaction): void {
    const costEUR = this.toEUR(tx.sentAmount, tx.sentAsset, tx.date);
    this.addLot(tx.receivedAsset, tx.receivedAmount, costEUR, tx.date, tx.exchange);
    // Increment global PA
    this.totalAcquisitionCost += costEUR;
  }

  private handleSell(tx: Transaction): void {
    const asset = tx.sentAsset;
    const amount = tx.sentAmount;

    // Crypto-to-crypto: NOT taxable (until 01/07/2026)
    if (!isFiatOrStable(tx.receivedAsset) && !isFiatOrStable(asset)) {
      return;
    }

    if (isFiatOrStable(asset)) {
      return;
    }

    // === PRIX DE CESSION ===
    const proceedsEUR = this.toEUR(tx.receivedAmount, tx.receivedAsset, tx.date);

    // === FRAIS (BOFIP BOI-RPPM-PVBMC-30-20) ===
    let feesEUR = 0;
    if (tx.feeAmount && tx.feeAmount > 0 && tx.feeAsset) {
      feesEUR = this.toEUR(tx.feeAmount, tx.feeAsset, tx.date);
    }
    const netProceedsEUR = proceedsEUR - feesEUR;

    // === VALEUR GLOBALE DU PORTEFEUILLE (VG) ===
    const totalPortfolioValue = this.getTotalPortfolioValueEUR(tx.date);

    // === FORMULE FRANCAISE (Article 150 VH bis CGI) ===
    //
    // PV = (PC - Frais) - PA × (PC - Frais) / VG
    //
    // PA = prix total d'acquisition NET (running total)
    // Apres cette cession, PA est decremente de la fraction allouee
    //
    const PA = this.totalAcquisitionCost;
    const ratio = totalPortfolioValue > 0 ? netProceedsEUR / totalPortfolioValue : 0;

    // Fraction du PA imputable a cette cession
    // Cap ratio at 1 to avoid negative PA (safety)
    const cappedRatio = Math.min(ratio, 1);
    const allocatedCost = PA * cappedRatio;

    // Plus ou moins-value
    const gainLoss = netProceedsEUR - allocatedCost;

    // Decrementer PA pour la prochaine cession
    this.totalAcquisitionCost -= allocatedCost;

    // === Mise a jour des lots (quantites seulement) ===
    const lots = this.lots.get(asset) || [];
    let remaining = amount;
    const lotsUsed: { lotId: string; amount: number; costBasis: number }[] = [];

    while (remaining > 0 && lots.length > 0) {
      const lot = lots[0];
      if (lot.amount <= remaining) {
        lotsUsed.push({ lotId: lot.id, amount: lot.amount, costBasis: lot.costBasisEUR });
        remaining -= lot.amount;
        lots.shift();
      } else {
        const fraction = remaining / lot.amount;
        const partialCost = lot.costBasisEUR * fraction;
        lotsUsed.push({ lotId: lot.id, amount: remaining, costBasis: partialCost });
        lot.amount -= remaining;
        lot.costBasisEUR -= partialCost;
        remaining = 0;
      }
    }

    const unitPrice = amount > 0 ? proceedsEUR / amount : 0;
    const hasPrices = this.prices.size > 0;

    this.events.push({
      id: `event-${this.events.length}`,
      date: tx.date,
      asset,
      amountSold: amount,
      unitPriceEUR: unitPrice,
      proceedsEUR,
      feesEUR,
      netProceedsEUR,
      costBasisEUR: allocatedCost,
      gainLoss,
      totalPortfolioValueEUR: totalPortfolioValue,
      priceSource: hasPrices ? 'api' : 'csv',
      exchange: tx.exchange,
      lotsUsed,
    });
  }

  private addLot(asset: string, amount: number, costEUR: number, date: Date, exchange: string): void {
    if (isFiatOrStable(asset) || amount <= 0) return;

    const lot: Lot = {
      id: `lot-${this.lotIdCounter++}`,
      asset,
      amount,
      costBasisEUR: costEUR,
      costPerUnit: amount > 0 ? costEUR / amount : 0,
      date,
      exchange,
    };

    if (!this.lots.has(asset)) {
      this.lots.set(asset, []);
    }
    this.lots.get(asset)!.push(lot);
  }

  /**
   * Valeur globale du portefeuille (VG)
   * = valeur de marche de TOUS les crypto detenus au moment de la cession
   */
  private getTotalPortfolioValueEUR(atDate: Date): number {
    let total = 0;

    for (const [asset, lots] of this.lots) {
      const totalAmount = lots.reduce((sum, lot) => sum + lot.amount, 0);
      if (totalAmount <= 0) continue;

      const costBasis = lots.reduce((sum, lot) => sum + lot.costBasisEUR, 0);

      if (this.prices.size > 0) {
        const marketValue = this.toEUR(totalAmount, asset, atDate);
        // Si le prix est dispo et raisonnable, utiliser la valeur de marche
        // Sinon fallback sur le cost basis
        total += (marketValue > 0) ? marketValue : costBasis;
      } else {
        total += costBasis;
      }
    }

    return total;
  }

  private toEUR(amount: number, asset: string, date?: Date): number {
    if (date && this.prices.size > 0) {
      return toEURWithPrices(amount, asset, date, this.prices);
    }

    const upper = asset.toUpperCase();
    if (upper === 'EUR') return amount;
    if (['USD', 'USDT', 'USDC', 'BUSD', 'TUSD', 'FDUSD', 'DAI', 'GUSD', 'USDP'].includes(upper)) {
      return amount * 0.92;
    }
    if (upper === 'GBP') return amount * 1.16;
    return 0;
  }
}

// ================================================

import type { TaxMode } from '../../types';
import { calculateFlatTax, calculateProgressiveTax } from '../tax-rules/france';

export function generateTaxSummary(
  events: TaxableEvent[],
  year: number,
  mode: TaxMode = 'flat_tax',
  otherIncome: number = 0,
): TaxSummary {
  const yearEvents = events.filter((e) => e.date.getFullYear() === year);

  const totalProceeds = yearEvents.reduce((sum, e) => sum + e.netProceedsEUR, 0);
  const totalCostBasis = yearEvents.reduce((sum, e) => sum + e.costBasisEUR, 0);

  const gains = yearEvents.filter((e) => e.gainLoss > 0);
  const losses = yearEvents.filter((e) => e.gainLoss < 0);

  const totalGain = gains.reduce((sum, e) => sum + e.gainLoss, 0);
  const totalLoss = Math.abs(losses.reduce((sum, e) => sum + e.gainLoss, 0));

  const netGainLoss = totalGain - totalLoss;

  const taxResult = mode === 'flat_tax'
    ? calculateFlatTax(netGainLoss, totalProceeds)
    : calculateProgressiveTax(netGainLoss, totalProceeds, otherIncome);

  return {
    year,
    totalProceeds,
    totalCostBasis,
    totalGain,
    totalLoss,
    netGainLoss,
    taxDue: taxResult.taxDue,
    incomeTaxPart: taxResult.incomeTax,
    socialChargesPart: taxResult.socialCharges,
    effectiveRate: taxResult.effectiveRate,
    isExempt: taxResult.isExempt,
    taxMode: mode,
    events: yearEvents,
    numberOfTransactions: yearEvents.length,
  };
}
