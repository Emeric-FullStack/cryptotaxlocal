/**
 * Binance Public API — Historical Prices
 *
 * Endpoint: /api/v3/klines (candlestick/OHLC data)
 * Free, no API key, no history limit, CORS OK from browser
 *
 * Strategy: fetch the daily candle for the date, use the close price
 */

const BINANCE_BASE = 'https://api.binance.com/api/v3';

// Map crypto symbols to Binance trading pairs (vs EUR and USDT)
// On cherche d'abord en EUR, puis en USDT (plus de liquidite)
const PAIR_SUFFIXES = ['EUR', 'USDT'];

const CACHE_PREFIX = 'cryptotaxlocal_price_binance_';

/**
 * Get the EUR price of a crypto asset on a specific date via Binance klines
 * Uses the daily close price
 */
export async function getBinanceHistoricalPriceEUR(symbol: string, date: Date): Promise<number | null> {
  const upper = symbol.toUpperCase();

  // Fiat/stables — no need to fetch
  if (upper === 'EUR') return 1;
  if (['USD', 'USDT', 'USDC', 'BUSD', 'TUSD', 'FDUSD', 'DAI', 'GUSD', 'USDP'].includes(upper)) {
    return 0.92; // Simplified USD/EUR
  }

  const dateStr = formatDate(date);
  const cacheKey = `${CACHE_PREFIX}${upper}:${dateStr}`;

  // Check cache
  const cached = localStorage.getItem(cacheKey);
  if (cached !== null) {
    return parseFloat(cached);
  }

  // Try EUR pair first, then USDT
  for (const suffix of PAIR_SUFFIXES) {
    const pair = `${upper}${suffix}`;
    const price = await fetchKlineClose(pair, date);

    if (price !== null) {
      // Convert USDT to EUR if needed
      let priceEUR = price;
      if (suffix === 'USDT') {
        priceEUR = price * 0.92; // Simplified — could also fetch EURUSDT
      }

      // Cache
      localStorage.setItem(cacheKey, priceEUR.toString());
      return priceEUR;
    }
  }

  return null;
}

/**
 * Fetch the daily close price for a Binance trading pair on a specific date
 */
async function fetchKlineClose(pair: string, date: Date): Promise<number | null> {
  try {
    // Start of the day in UTC
    const startOfDay = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const startTime = startOfDay.getTime();
    const endTime = startTime + 24 * 60 * 60 * 1000; // +24h

    const url = `${BINANCE_BASE}/klines?symbol=${pair}&interval=1d&startTime=${startTime}&endTime=${endTime}&limit=1`;

    const response = await fetch(url);

    if (!response.ok) {
      // Pair doesn't exist on Binance (e.g., some altcoins)
      return null;
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    // Kline format: [openTime, open, high, low, close, volume, closeTime, ...]
    const closePrice = parseFloat(data[0][4]);
    if (isNaN(closePrice) || closePrice <= 0) return null;

    return closePrice;
  } catch {
    return null;
  }
}

/**
 * Check if Binance has a trading pair for this symbol
 */
export function isBinancePairAvailable(symbol: string): boolean {
  // Most major cryptos are on Binance
  // This is a best-effort check — the real check happens at fetch time
  const upper = symbol.toUpperCase();
  const excluded = ['EUR', 'USD', 'USDT', 'USDC', 'BUSD', 'TUSD', 'FDUSD', 'DAI', 'GUSD', 'USDP', 'GBP', 'CHF'];
  return !excluded.includes(upper);
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
