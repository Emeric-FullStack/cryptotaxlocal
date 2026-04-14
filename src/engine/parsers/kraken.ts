import Papa from 'papaparse';
import type { Transaction, ParseResult, ParseError } from '../../types';

/**
 * Parse Kraken ledger/trades CSV
 * Kraken trades columns: txid, ordertxid, pair, time, type, ordertype, price, cost, fee, vol, margin, misc, ledgers
 */
export function parseKrakenCSV(csvContent: string): ParseResult {
  const transactions: Transaction[] = [];
  const errors: ParseError[] = [];

  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim().replace(/"/g, ''),
  });

  if (parsed.errors.length > 0) {
    parsed.errors.forEach((e) => {
      errors.push({ row: e.row ?? 0, message: e.message });
    });
  }

  const rows = parsed.data as Record<string, string>[];

  for (let i = 0; i < rows.length; i++) {
    try {
      const row = rows[i];
      const tx = parseKrakenRow(row, i);
      if (tx) transactions.push(tx);
    } catch (e) {
      errors.push({
        row: i + 2,
        message: e instanceof Error ? e.message : 'Unknown parsing error',
        data: rows[i],
      });
    }
  }

  return {
    transactions: transactions.sort((a, b) => a.date.getTime() - b.date.getTime()),
    errors,
    exchange: 'kraken',
    rowsParsed: rows.length,
  };
}

function parseKrakenRow(row: Record<string, string>, index: number): Transaction | null {
  const dateStr = row['time'] || row['closetm'] || '';
  if (!dateStr) return null;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) throw new Error(`Invalid date: ${dateStr}`);

  const pair = row['pair'] || '';
  const type = (row['type'] || '').toLowerCase();
  const orderType = row['ordertype'] || row['order-type'] || row['order type'] || '';
  void orderType; // Available for future use
  const price = parseFloat(row['price'] || '0');
  const vol = parseFloat(row['vol'] || '0');
  const cost = parseFloat(row['cost'] || '0') || (price * vol);
  const fee = parseFloat(row['fee'] || '0');

  if (!pair || vol === 0) return null;

  const { base, quote } = parseKrakenPair(pair);
  const isBuy = type === 'buy';

  return {
    id: `kraken-${index}-${row['txid'] || date.getTime()}`,
    date,
    type: isBuy ? 'buy' : 'sell',
    receivedAsset: isBuy ? base : quote,
    receivedAmount: isBuy ? vol : cost,
    sentAsset: isBuy ? quote : base,
    sentAmount: isBuy ? cost : vol,
    feeAsset: quote,
    feeAmount: fee,
    exchange: 'kraken',
    originalRow: row,
  };
}

// Kraken uses X/Z prefixes and specific pair names
const KRAKEN_PAIRS: Record<string, { base: string; quote: string }> = {
  'XXBTZEUR': { base: 'BTC', quote: 'EUR' },
  'XXBTZUSD': { base: 'BTC', quote: 'USD' },
  'XETHZEUR': { base: 'ETH', quote: 'EUR' },
  'XETHZUSD': { base: 'ETH', quote: 'USD' },
  'XXRPZEUR': { base: 'XRP', quote: 'EUR' },
  'XLTCZEUR': { base: 'LTC', quote: 'EUR' },
};

const KRAKEN_QUOTES = ['ZEUR', 'ZUSD', 'EUR', 'USD', 'USDT', 'USDC', 'XBT', 'ETH'];

function parseKrakenPair(pair: string): { base: string; quote: string } {
  // Check known pairs first
  if (KRAKEN_PAIRS[pair]) return KRAKEN_PAIRS[pair];

  // Try known quotes
  const sorted = [...KRAKEN_QUOTES].sort((a, b) => b.length - a.length);
  for (const quote of sorted) {
    if (pair.endsWith(quote) && pair.length > quote.length) {
      let base = pair.slice(0, -quote.length);
      // Kraken renames
      if (base === 'XXBT' || base === 'XBT') base = 'BTC';
      if (base.startsWith('X') && base.length === 4) base = base.slice(1);

      let q = quote;
      if (q === 'ZEUR') q = 'EUR';
      if (q === 'ZUSD') q = 'USD';
      if (q.startsWith('Z') && q.length === 4) q = q.slice(1);

      return { base, quote: q };
    }
  }

  // Fallback: try splitting by known delimiter patterns
  if (pair.includes('/')) {
    const [base, quote] = pair.split('/');
    return { base, quote };
  }

  return { base: pair.slice(0, 3), quote: pair.slice(3) };
}
