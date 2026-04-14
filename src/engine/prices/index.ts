export { clearPriceCache, getPriceCacheStats } from './coingecko';

import type { Transaction } from '../../types';
import { getBinanceHistoricalPriceEUR } from './binance-api';
import { getHistoricalPriceEUR as getCoinGeckoPrice, lookupPrice as cgLookup } from './coingecko';

/**
 * Multi-source price service
 *
 * Priority:
 * 1. Local cache (localStorage) — instant
 * 2. Binance public API — free, no key, no history limit
 * 3. CoinGecko — fallback for non-Binance pairs, limited to 365 days
 *
 * All prices are cached after first fetch.
 */

export type PriceMap = Map<string, number>;

const FIAT_LIKE = new Set([
  'EUR', 'USD', 'USDT', 'USDC', 'BUSD', 'TUSD', 'FDUSD', 'DAI', 'GUSD', 'USDP', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY',
]);

function isFiatLike(asset: string): boolean {
  return FIAT_LIKE.has(asset.toUpperCase());
}

/**
 * Get historical price — tries Binance first, then CoinGecko
 */
async function getHistoricalPrice(symbol: string, date: Date): Promise<number | null> {
  const upper = symbol.toUpperCase();

  if (upper === 'EUR') return 1;
  if (['USD', 'USDT', 'USDC', 'BUSD', 'TUSD', 'FDUSD', 'DAI', 'GUSD', 'USDP'].includes(upper)) return 0.92;
  if (upper === 'GBP') return 1.16;

  // Try Binance first (no history limit)
  const binancePrice = await getBinanceHistoricalPriceEUR(symbol, date);
  if (binancePrice !== null) return binancePrice;

  // Fallback: CoinGecko (limited to 365 days)
  const cgPrice = await getCoinGeckoPrice(symbol, date);
  if (cgPrice !== null) return cgPrice;

  return null;
}

/**
 * Pre-fetch all prices needed for a list of transactions
 */
export async function prefetchPrices(
  transactions: Transaction[],
  onProgress?: (done: number, total: number, skippedOld?: number) => void,
): Promise<PriceMap> {
  const results = new Map<string, number>();
  const sorted = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Collect unique requests
  const requests: { symbol: string; date: Date }[] = [];
  const heldAssets = new Set<string>();

  for (const tx of sorted) {
    if (tx.receivedAsset && !isFiatLike(tx.receivedAsset)) {
      heldAssets.add(tx.receivedAsset.toUpperCase());
    }

    // On a sell, need prices for ALL held assets (portfolio valuation)
    if (tx.type === 'sell') {
      for (const asset of heldAssets) {
        requests.push({ symbol: asset, date: tx.date });
      }
    }

    if (tx.receivedAsset && !isFiatLike(tx.receivedAsset)) {
      requests.push({ symbol: tx.receivedAsset, date: tx.date });
    }
    if (tx.sentAsset && !isFiatLike(tx.sentAsset)) {
      requests.push({ symbol: tx.sentAsset, date: tx.date });
    }
    if (tx.feeAsset && tx.feeAmount && tx.feeAmount > 0 && !isFiatLike(tx.feeAsset)) {
      requests.push({ symbol: tx.feeAsset, date: tx.date });
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = requests.filter((r) => {
    const key = `${r.symbol.toUpperCase()}:${formatDate(r.date)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const total = unique.length;
  let done = 0;
  let failed = 0;

  for (const req of unique) {
    const key = `${req.symbol}:${formatDate(req.date)}`;

    const price = await getHistoricalPrice(req.symbol, req.date);
    if (price !== null) {
      results.set(key, price);
    } else {
      failed++;
    }

    done++;
    onProgress?.(done, total, failed);

    // Small delay between non-cached API calls to be polite
    // Binance is fast but we don't want to spam
    if (done % 5 === 0) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return results;
}

/**
 * Convert an amount to EUR using the price map
 */
export function toEURWithPrices(amount: number, asset: string, date: Date, prices: PriceMap): number {
  const upper = asset.toUpperCase();

  if (upper === 'EUR') return amount;
  if (['USD', 'USDT', 'USDC', 'BUSD', 'TUSD', 'FDUSD', 'DAI', 'GUSD', 'USDP'].includes(upper)) return amount * 0.92;
  if (upper === 'GBP') return amount * 1.16;

  // Try price map (Binance or CoinGecko key format)
  const key = `${asset}:${formatDate(date)}`;
  const price = prices.get(key);
  if (price !== undefined) {
    return amount * price;
  }

  // Also try CoinGecko key format (dd-mm-yyyy)
  const cgPrice = cgLookup(prices, asset, date);
  if (cgPrice !== null) {
    return amount * cgPrice;
  }

  // IMPORTANT: ne PAS retourner 'amount' brut pour un crypto
  // car 0.5 BTC serait interprete comme 0.5 EUR, ce qui fausse tout.
  // Retourner 0 pour signaler que le prix est inconnu.
  // Le calcul utilisera le cost basis en fallback.
  return 0;
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
