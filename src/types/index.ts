// === Core Transaction Types ===

export type TransactionType = 'buy' | 'sell' | 'swap' | 'staking_reward' | 'airdrop' | 'fee';

export interface Transaction {
  id: string;
  date: Date;
  type: TransactionType;
  // What you received
  receivedAsset: string;
  receivedAmount: number;
  // What you gave
  sentAsset: string;
  sentAmount: number;
  // Fee
  feeAsset?: string;
  feeAmount?: number;
  // Metadata
  exchange: string;
  originalRow?: Record<string, string>;
}

// === Portfolio / Lot Tracking ===

export interface Lot {
  id: string;
  asset: string;
  amount: number;
  costBasisEUR: number; // Total cost in EUR
  costPerUnit: number;  // Cost per unit in EUR
  date: Date;
  exchange: string;
}

// === Tax Calculation Results ===

export interface TaxableEvent {
  id: string;
  date: Date;
  asset: string;
  amountSold: number;
  unitPriceEUR: number;      // Cours unitaire EUR au moment de la cession
  proceedsEUR: number;       // Prix de cession brut (avant deduction des frais)
  feesEUR: number;           // Frais en EUR (exchange + gas)
  netProceedsEUR: number;    // Prix de cession net (apres deduction des frais)
  costBasisEUR: number;      // Prix d'acquisition (FIFO)
  gainLoss: number;          // Plus ou moins-value
  totalPortfolioValueEUR: number; // Valeur globale du portefeuille au moment de la cession
  priceSource: 'csv' | 'api' | 'manual'; // Source du prix (api = Binance/CoinGecko)
  exchange: string;
  lotsUsed: { lotId: string; amount: number; costBasis: number }[];
}

export type TaxMode = 'flat_tax' | 'progressive';

export interface TaxSummary {
  year: number;
  totalProceeds: number;      // Total des cessions
  totalCostBasis: number;     // Total des prix d'acquisition
  totalGain: number;          // Plus-value nette
  totalLoss: number;          // Moins-value
  netGainLoss: number;        // Gain net imposable
  taxDue: number;             // Impot du
  incomeTaxPart: number;      // IR
  socialChargesPart: number;  // Prelevements sociaux
  effectiveRate: number;      // Taux effectif
  isExempt: boolean;          // Exonere (< 305 EUR de cessions)
  taxMode: TaxMode;           // Mode de calcul utilise
  events: TaxableEvent[];
  numberOfTransactions: number;
}

// === Parser Types ===

export type ExchangeName = 'binance' | 'kraken' | 'coinbase' | 'kucoin' | 'manual';

export interface ParseResult {
  transactions: Transaction[];
  errors: ParseError[];
  exchange: ExchangeName;
  rowsParsed: number;
}

export interface ParseError {
  row: number;
  message: string;
  data?: Record<string, string>;
}

// === App State ===

export type AppStep = 'import' | 'review' | 'results';

export interface AppState {
  step: AppStep;
  transactions: Transaction[];
  parseErrors: ParseError[];
  taxSummary: TaxSummary | null;
  selectedYear: number;
}
