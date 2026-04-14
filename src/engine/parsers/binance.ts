import Papa from 'papaparse';
import type { Transaction, ParseResult, ParseError } from '../../types';

/**
 * Parse Binance CSV exports
 *
 * Supports multiple Binance export formats:
 *
 * 1. Trade History (current 2025-2026):
 *    Time, Base-Asset, Quote-Asset, Type, Price, Quantity, Total, Fee, Fee-Currency, Trade-ID
 *
 * 2. Transaction History (Generate Transaction Records):
 *    User_ID, UTC_Time, Account, Operation, Coin, Change, Remark
 *
 * 3. Legacy trade format (pre-2022, still found in old exports):
 *    Date(UTC), Pair, Side, Price, Executed, Amount, Fee
 *
 * 4. Order History:
 *    Date(UTC), OrderNo, Pair, Type, Order Price, Order Amount, AvgTrading Price, Filled, Total, status
 */
export function parseBinanceCSV(csvContent: string): ParseResult {
  const transactions: Transaction[] = [];
  const errors: ParseError[] = [];

  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  });

  if (parsed.errors.length > 0) {
    parsed.errors.forEach((e) => {
      errors.push({ row: e.row ?? 0, message: e.message });
    });
  }

  const rows = parsed.data as Record<string, string>[];
  if (rows.length === 0) {
    return { transactions: [], errors, exchange: 'binance', rowsParsed: 0 };
  }

  // Detect which format we're dealing with
  const firstRow = rows[0];
  const format = detectBinanceFormat(firstRow);

  for (let i = 0; i < rows.length; i++) {
    try {
      const row = rows[i];
      let tx: Transaction | null = null;

      switch (format) {
        case 'trade_history':
          tx = parseTradeHistory(row, i);
          break;
        case 'transaction_history':
          tx = parseTransactionHistory(row, i);
          break;
        case 'legacy':
          tx = parseLegacyFormat(row, i);
          break;
        case 'order_history':
          tx = parseOrderHistory(row, i);
          break;
      }

      if (tx) transactions.push(tx);
    } catch (e) {
      errors.push({
        row: i + 2,
        message: e instanceof Error ? e.message : 'Erreur de parsing inconnue',
        data: rows[i],
      });
    }
  }

  return {
    transactions: transactions.sort((a, b) => a.date.getTime() - b.date.getTime()),
    errors,
    exchange: 'binance',
    rowsParsed: rows.length,
  };
}

type BinanceFormat = 'trade_history' | 'transaction_history' | 'legacy' | 'order_history';

function detectBinanceFormat(row: Record<string, string>): BinanceFormat {
  const keys = Object.keys(row).map((k) => k.toLowerCase().replace(/[-_\s]/g, ''));

  // Current Trade History: has "Base-Asset" and "Quote-Asset"
  if (keys.some((k) => k.includes('baseasset')) && keys.some((k) => k.includes('quoteasset'))) {
    return 'trade_history';
  }

  // Transaction History: has "Operation" and "Coin" and "Change"
  if (keys.some((k) => k === 'operation') && keys.some((k) => k === 'coin')) {
    return 'transaction_history';
  }

  // Order History: has "OrderNo" or "AvgTrading Price"
  if (keys.some((k) => k === 'orderno') || keys.some((k) => k.includes('avgtradingprice'))) {
    return 'order_history';
  }

  // Legacy: has "Pair" and "Side" or "Executed"
  return 'legacy';
}

/**
 * Format 1: Current Trade History (2025-2026)
 * Time, Base-Asset, Quote-Asset, Type, Price, Quantity, Total, Fee, Fee-Currency, Trade-ID
 */
function parseTradeHistory(row: Record<string, string>, index: number): Transaction | null {
  const dateStr = row['Time'] || row['time'];
  if (!dateStr) return null;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) throw new Error(`Date invalide: ${dateStr}`);

  const baseAsset = (row['Base-Asset'] || row['Base Asset'] || '').toUpperCase();
  const quoteAsset = (row['Quote-Asset'] || row['Quote Asset'] || '').toUpperCase();
  const type = (row['Type'] || row['type'] || '').toUpperCase();
  const price = parseFloat(row['Price'] || row['price'] || '0');
  const quantity = parseFloat(row['Quantity'] || row['quantity'] || '0');
  const total = parseFloat(row['Total'] || row['total'] || '0') || (price * quantity);
  const fee = parseFloat(row['Fee'] || row['fee'] || '0');
  const feeCurrency = (row['Fee-Currency'] || row['Fee Currency'] || quoteAsset).toUpperCase();

  if (!baseAsset || quantity === 0) return null;

  const isBuy = type === 'BUY';

  return {
    id: `binance-trade-${index}-${date.getTime()}`,
    date,
    type: isBuy ? 'buy' : 'sell',
    receivedAsset: isBuy ? baseAsset : quoteAsset,
    receivedAmount: isBuy ? quantity : total,
    sentAsset: isBuy ? quoteAsset : baseAsset,
    sentAmount: isBuy ? total : quantity,
    feeAsset: feeCurrency,
    feeAmount: fee,
    exchange: 'binance',
    originalRow: row,
  };
}

/**
 * Format 2: Transaction History (Generate Transaction Records)
 * User_ID, UTC_Time, Account, Operation, Coin, Change, Remark
 */
function parseTransactionHistory(row: Record<string, string>, index: number): Transaction | null {
  const dateStr = row['UTC_Time'] || row['UTC Time'] || row['Time'];
  if (!dateStr) return null;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) throw new Error(`Date invalide: ${dateStr}`);

  const operation = (row['Operation'] || row['operation'] || '').toLowerCase();
  const coin = (row['Coin'] || row['coin'] || '').toUpperCase();
  const change = parseFloat(row['Change'] || row['change'] || '0');

  if (!coin || change === 0) return null;

  // Map Binance operations to our transaction types
  switch (operation) {
    case 'buy':
    case 'spot_trading_buy':
      return {
        id: `binance-tx-${index}-${date.getTime()}`,
        date,
        type: 'buy',
        receivedAsset: coin,
        receivedAmount: Math.abs(change),
        sentAsset: 'EUR', // Simplified — real pair info not in this format
        sentAmount: 0,
        exchange: 'binance',
        originalRow: row,
      };

    case 'sell':
    case 'spot_trading_sell':
      return {
        id: `binance-tx-${index}-${date.getTime()}`,
        date,
        type: 'sell',
        receivedAsset: 'EUR',
        receivedAmount: 0,
        sentAsset: coin,
        sentAmount: Math.abs(change),
        exchange: 'binance',
        originalRow: row,
      };

    case 'staking rewards':
    case 'staking_rewards':
    case 'eth 2.0 staking rewards':
    case 'simple earn flexible interest':
    case 'savings interest':
      return {
        id: `binance-tx-${index}-${date.getTime()}`,
        date,
        type: 'staking_reward',
        receivedAsset: coin,
        receivedAmount: Math.abs(change),
        sentAsset: '',
        sentAmount: 0,
        exchange: 'binance',
        originalRow: row,
      };

    case 'distribution':
    case 'airdrop':
      return {
        id: `binance-tx-${index}-${date.getTime()}`,
        date,
        type: 'airdrop',
        receivedAsset: coin,
        receivedAmount: Math.abs(change),
        sentAsset: '',
        sentAmount: 0,
        exchange: 'binance',
        originalRow: row,
      };

    case 'deposit':
    case 'withdraw':
    case 'transfer_in':
    case 'transfer_out':
      // Not taxable events
      return null;

    case 'fee':
    case 'commission':
    case 'transaction_fee':
      // Fee entries — skip (fees are accounted for in trade entries)
      return null;

    default:
      // Unknown operation — skip silently
      return null;
  }
}

/**
 * Format 3: Legacy trade format (pre-2022)
 * Date(UTC), Pair, Side, Price, Executed, Amount, Fee
 */
function parseLegacyFormat(row: Record<string, string>, index: number): Transaction | null {
  const dateStr = row['Date(UTC)'] || row['Date'] || row['date'];
  if (!dateStr) return null;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) throw new Error(`Date invalide: ${dateStr}`);

  const pair = row['Pair'] || row['Market'] || '';
  const side = (row['Side'] || row['Type'] || '').toUpperCase();
  const price = parseFloat(row['Price'] || '0');
  const executed = parseFloat(row['Executed'] || row['Filled'] || row['Quantity'] || '0');
  const total = parseFloat(row['Amount'] || row['Total'] || '0') || (price * executed);

  // Fee can be "0.001 BNB" or just "0.001"
  const feeStr = row['Fee'] || '0';
  let feeAmount = 0;
  let feeAsset = '';
  if (feeStr) {
    const feeParts = feeStr.trim().split(/\s+/);
    feeAmount = parseFloat(feeParts[0]) || 0;
    feeAsset = (feeParts[1] || '').toUpperCase();
  }

  if (!pair || executed === 0) return null;

  const { base, quote } = parseTradingPair(pair);
  const isBuy = side === 'BUY';

  return {
    id: `binance-legacy-${index}-${date.getTime()}`,
    date,
    type: isBuy ? 'buy' : 'sell',
    receivedAsset: isBuy ? base : quote,
    receivedAmount: isBuy ? executed : total,
    sentAsset: isBuy ? quote : base,
    sentAmount: isBuy ? total : executed,
    feeAsset: feeAsset || quote,
    feeAmount,
    exchange: 'binance',
    originalRow: row,
  };
}

/**
 * Format 4: Order History
 * Date(UTC), OrderNo, Pair, Type, Order Price, Order Amount, AvgTrading Price, Filled, Total, status
 */
function parseOrderHistory(row: Record<string, string>, index: number): Transaction | null {
  const dateStr = row['Date(UTC)'] || row['Date'] || row['Time'];
  if (!dateStr) return null;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) throw new Error(`Date invalide: ${dateStr}`);

  const status = (row['status'] || row['Status'] || '').toUpperCase();
  if (status !== 'FILLED' && status !== '') return null; // Skip unfilled orders

  const pair = row['Pair'] || row['Market'] || '';
  const type = (row['Type'] || '').toUpperCase();
  const price = parseFloat(row['AvgTrading Price'] || row['Order Price'] || row['Price'] || '0');
  const filled = parseFloat(row['Filled'] || row['Quantity'] || '0');
  const total = parseFloat(row['Total'] || '0') || (price * filled);

  if (!pair || filled === 0) return null;

  const { base, quote } = parseTradingPair(pair);
  const isBuy = type === 'BUY';

  return {
    id: `binance-order-${index}-${date.getTime()}`,
    date,
    type: isBuy ? 'buy' : 'sell',
    receivedAsset: isBuy ? base : quote,
    receivedAmount: isBuy ? filled : total,
    sentAsset: isBuy ? quote : base,
    sentAmount: isBuy ? total : filled,
    exchange: 'binance',
    originalRow: row,
  };
}

// ================================================
// Helpers
// ================================================

const QUOTE_ASSETS = ['USDT', 'BUSD', 'USDC', 'EUR', 'USD', 'BTC', 'ETH', 'BNB', 'TUSD', 'FDUSD', 'DAI', 'TRY', 'BRL', 'GBP', 'AUD'];

function parseTradingPair(pair: string): { base: string; quote: string } {
  const sorted = [...QUOTE_ASSETS].sort((a, b) => b.length - a.length);
  for (const quote of sorted) {
    if (pair.endsWith(quote) && pair.length > quote.length) {
      return { base: pair.slice(0, -quote.length), quote };
    }
  }
  const mid = Math.ceil(pair.length / 2);
  return { base: pair.slice(0, mid), quote: pair.slice(mid) };
}
