/**
 * Bitcoin balance fetcher via mempool.space REST API
 *
 * Queries address balances with rate-limit handling (429 retry + sequential delay).
 * Also fetches BTC/EUR spot price.
 */

const MEMPOOL_API = 'https://mempool.space/api';

/** Delay between sequential address queries (ms) */
const REQUEST_DELAY_MS = 200;

/** Max retries on 429 Too Many Requests */
const MAX_RETRIES = 3;

/** Base backoff delay on 429 (ms), doubled each retry */
const BACKOFF_BASE_MS = 2000;

export interface AddressBalance {
  address: string;
  /** Confirmed balance in satoshis */
  confirmed: number;
  /** Unconfirmed (mempool) balance in satoshis */
  unconfirmed: number;
  /** Total balance in satoshis */
  total: number;
  /** Number of transactions */
  txCount: number;
}

export interface DonationSummary {
  /** Individual address balances */
  addresses: AddressBalance[];
  /** Total received across all addresses, in satoshis */
  totalSats: number;
  /** Total received in BTC */
  totalBtc: number;
  /** BTC/EUR spot price at time of fetch */
  btcEurPrice: number | null;
  /** Total received in EUR (null if price unavailable) */
  totalEur: number | null;
  /** Timestamp of the fetch */
  fetchedAt: number;
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with retry on 429 (rate limit)
 */
async function fetchWithRetry(
  url: string,
  signal?: AbortSignal
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    try {
      const res = await fetch(url, { signal });

      if (res.ok) return res;

      if (res.status === 429) {
        const backoff = BACKOFF_BASE_MS * Math.pow(2, attempt);
        console.warn(
          `[balance-fetcher] 429 rate limited, retry ${attempt + 1}/${MAX_RETRIES} in ${backoff}ms`
        );
        await sleep(backoff);
        continue;
      }

      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        await sleep(BACKOFF_BASE_MS * Math.pow(2, attempt));
      }
    }
  }

  throw lastError ?? new Error('Max retries exceeded');
}

/**
 * Fetch balance for a single address from mempool.space
 *
 * Endpoint: GET /api/address/{address}
 * Returns chain_stats + mempool_stats with funded/spent sums.
 */
async function fetchAddressBalance(
  address: string,
  signal?: AbortSignal
): Promise<AddressBalance> {
  const res = await fetchWithRetry(`${MEMPOOL_API}/address/${address}`, signal);
  const data = await res.json();

  const chain = data.chain_stats;
  const mempool = data.mempool_stats;

  const confirmed = (chain.funded_txo_sum ?? 0) - (chain.spent_txo_sum ?? 0);
  const unconfirmed =
    (mempool.funded_txo_sum ?? 0) - (mempool.spent_txo_sum ?? 0);

  return {
    address,
    confirmed,
    unconfirmed,
    total: confirmed + unconfirmed,
    txCount: (chain.tx_count ?? 0) + (mempool.tx_count ?? 0),
  };
}

/**
 * Fetch BTC/EUR price from mempool.space
 *
 * Endpoint: GET /api/v1/prices
 */
async function fetchBtcEurPrice(
  signal?: AbortSignal
): Promise<number | null> {
  try {
    const res = await fetchWithRetry(`${MEMPOOL_API}/v1/prices`, signal);
    const data = await res.json();
    return data.EUR ?? null;
  } catch (err) {
    console.warn('[balance-fetcher] Failed to fetch BTC/EUR price:', err);
    return null;
  }
}

/**
 * Fetch balances for multiple addresses sequentially (to respect rate limits)
 * and compute total donation summary.
 *
 * @param addresses - Array of bc1q addresses
 * @param onProgress - Optional callback with (completed, total) for UI updates
 * @param signal - Optional AbortSignal for cancellation
 */
export async function fetchDonationSummary(
  addresses: string[],
  onProgress?: (completed: number, total: number) => void,
  signal?: AbortSignal
): Promise<DonationSummary> {
  const balances: AddressBalance[] = [];

  // Fetch balances sequentially with delay between requests
  for (let i = 0; i < addresses.length; i++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    const balance = await fetchAddressBalance(addresses[i], signal);
    balances.push(balance);
    onProgress?.(i + 1, addresses.length);

    // Delay between requests (skip after last one)
    if (i < addresses.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  // Fetch BTC/EUR price in parallel with... well, after addresses since we're sequential
  const btcEurPrice = await fetchBtcEurPrice(signal);

  const totalSats = balances.reduce((sum, b) => sum + b.total, 0);
  const totalBtc = totalSats / 100_000_000;

  return {
    addresses: balances,
    totalSats,
    totalBtc,
    btcEurPrice,
    totalEur: btcEurPrice !== null ? totalBtc * btcEurPrice : null,
    fetchedAt: Date.now(),
  };
}
