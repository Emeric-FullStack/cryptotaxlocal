/**
 * CoinGecko Historical Price Service
 *
 * Free tier: 30 calls/min, 10,000 calls/month, no API key required
 * Endpoint: /coins/{id}/history?date=dd-mm-yyyy
 * CORS: works from browser
 *
 * Strategy:
 * 1. Cache all fetched prices in localStorage to avoid repeat calls
 * 2. Batch requests with rate limiting (max 25/min to stay safe)
 * 3. Fallback to simplified rates if API fails
 */

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Map common crypto symbols to CoinGecko IDs
const SYMBOL_TO_ID: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'XRP': 'ripple',
  'BNB': 'binancecoin',
  'ADA': 'cardano',
  'DOT': 'polkadot',
  'DOGE': 'dogecoin',
  'AVAX': 'avalanche-2',
  'MATIC': 'matic-network',
  'POL': 'matic-network',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'LTC': 'litecoin',
  'NEAR': 'near',
  'APT': 'aptos',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'FIL': 'filecoin',
  'AAVE': 'aave',
  'MKR': 'maker',
  'CRO': 'crypto-com-chain',
  'ALGO': 'algorand',
  'FTM': 'fantom',
  'SAND': 'the-sandbox',
  'MANA': 'decentraland',
  'AXS': 'axie-infinity',
  'SHIB': 'shiba-inu',
  'PEPE': 'pepe',
};

// Cache key format: "price:{coinId}:{date}" -> EUR price
const CACHE_PREFIX = 'cryptotaxlocal_price_';

// CoinGecko free tier: max 365 days of historical data
const MAX_HISTORY_DAYS = 365;

/**
 * Get the EUR price of a crypto asset on a specific date
 * Returns cached value if available, otherwise fetches from CoinGecko
 *
 * Limitation free tier : historique limite a 365 jours.
 * Au-dela, retourne null et le calculateur utilisera les taux simplifies.
 */
export async function getHistoricalPriceEUR(symbol: string, date: Date): Promise<number | null> {
  const upper = symbol.toUpperCase();

  // Fiat and stablecoins — no need to fetch
  if (['EUR'].includes(upper)) return 1;
  if (['USD', 'USDT', 'USDC', 'BUSD', 'TUSD', 'FDUSD', 'DAI', 'GUSD', 'USDP'].includes(upper)) {
    return 0.92;
  }

  const coinId = SYMBOL_TO_ID[upper];
  if (!coinId) return null;

  // Check if date is within CoinGecko free tier limit (365 days)
  const now = new Date();
  const ageInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (ageInDays > MAX_HISTORY_DAYS) {
    // Date too old for free tier — return null, fallback will be used
    return null;
  }

  const dateStr = formatDateForCoinGecko(date);
  const cacheKey = `${CACHE_PREFIX}${coinId}:${dateStr}`;

  // Check cache first
  const cached = localStorage.getItem(cacheKey);
  if (cached !== null) {
    return parseFloat(cached);
  }

  // Fetch from CoinGecko
  try {
    const url = `${COINGECKO_BASE}/coins/${coinId}/history?date=${dateStr}&localization=false`;
    const response = await fetch(url);

    if (response.status === 429) {
      console.warn(`CoinGecko rate limit for ${symbol} on ${dateStr}`);
      return null;
    }

    if (!response.ok) {
      // 401/403 = beyond free tier historical limit
      if (response.status === 401 || response.status === 403) {
        console.warn(`CoinGecko: date ${dateStr} beyond free tier limit for ${symbol}`);
        return null;
      }
      console.warn(`CoinGecko API error: ${response.status} for ${symbol} on ${dateStr}`);
      return null;
    }

    const data = await response.json();
    const price = data?.market_data?.current_price?.eur;

    if (typeof price === 'number' && price > 0) {
      localStorage.setItem(cacheKey, price.toString());
      return price;
    }

    return null;
  } catch (error) {
    console.warn(`Failed to fetch price for ${symbol} on ${dateStr}:`, error);
    return null;
  }
}

/**
 * Batch fetch prices for multiple (symbol, date) pairs
 * Respects rate limits by spacing requests
 *
 * @param onProgress - callback with (done, total, skippedOld) counts
 */
export async function batchGetPricesEUR(
  requests: { symbol: string; date: Date }[],
  onProgress?: (done: number, total: number, skippedOld?: number) => void,
): Promise<Map<string, number>> {
  const results = new Map<string, number>();
  const uniqueRequests = deduplicateRequests(requests);
  const total = uniqueRequests.length;
  let done = 0;
  let skippedOld = 0;

  const now = new Date();

  for (const req of uniqueRequests) {
    const key = `${req.symbol}:${formatDateForCoinGecko(req.date)}`;

    // Check if too old before even trying
    const ageInDays = Math.floor((now.getTime() - req.date.getTime()) / (1000 * 60 * 60 * 24));
    if (ageInDays > MAX_HISTORY_DAYS && !['EUR', 'USD', 'USDT', 'USDC', 'BUSD', 'TUSD', 'FDUSD', 'DAI', 'GUSD', 'USDP'].includes(req.symbol.toUpperCase())) {
      const coinId = SYMBOL_TO_ID[req.symbol.toUpperCase()];
      const cacheKey = `${CACHE_PREFIX}${coinId}:${formatDateForCoinGecko(req.date)}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        results.set(key, parseFloat(cached));
      } else {
        skippedOld++;
      }
      done++;
      onProgress?.(done, total, skippedOld);
      continue;
    }

    const price = await getHistoricalPriceEUR(req.symbol, req.date);
    if (price !== null) {
      results.set(key, price);
    }

    done++;
    onProgress?.(done, total, skippedOld);

    // Rate limiting: only delay on actual API calls (not cached)
    const coinId = SYMBOL_TO_ID[req.symbol.toUpperCase()];
    if (coinId) {
      const cached = localStorage.getItem(`${CACHE_PREFIX}${coinId}:${formatDateForCoinGecko(req.date)}`);
      if (!cached) {
        await sleep(2500);
      }
    }
  }

  return results;
}

/**
 * Lookup a price from batch results
 */
export function lookupPrice(prices: Map<string, number>, symbol: string, date: Date): number | null {
  const key = `${symbol}:${formatDateForCoinGecko(date)}`;
  return prices.get(key) ?? null;
}

/**
 * Get the CoinGecko ID for a symbol (or null if unknown)
 */
export function getCoinGeckoId(symbol: string): string | null {
  return SYMBOL_TO_ID[symbol.toUpperCase()] ?? null;
}

/**
 * Check if a symbol is supported by our price service
 */
export function isSymbolSupported(symbol: string): boolean {
  const upper = symbol.toUpperCase();
  return upper === 'EUR'
    || ['USD', 'USDT', 'USDC', 'BUSD', 'TUSD', 'FDUSD', 'DAI', 'GUSD', 'USDP'].includes(upper)
    || upper in SYMBOL_TO_ID;
}

/**
 * Clear the price cache
 */
export function clearPriceCache(): void {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
  keys.forEach((k) => localStorage.removeItem(k));
}

/**
 * Get cache stats
 */
export function getPriceCacheStats(): { entries: number; oldestDate: string | null } {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
  return {
    entries: keys.length,
    oldestDate: keys.length > 0 ? keys.sort()[0].replace(CACHE_PREFIX, '') : null,
  };
}

// ================================================
// Helpers
// ================================================

function formatDateForCoinGecko(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function deduplicateRequests(requests: { symbol: string; date: Date }[]): { symbol: string; date: Date }[] {
  const seen = new Set<string>();
  return requests.filter((r) => {
    const key = `${r.symbol}:${formatDateForCoinGecko(r.date)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
