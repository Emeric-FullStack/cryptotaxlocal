import { parseBinanceCSV } from './binance';
import { parseKrakenCSV } from './kraken';
import { parseCoinbaseCSV } from './coinbase';
import { parseRevolutCSV } from './revolut';
import type { ExchangeName, ParseResult } from '../../types';

export { parseBinanceCSV } from './binance';
export { parseKrakenCSV } from './kraken';
export { parseCoinbaseCSV } from './coinbase';
export { parseRevolutCSV } from './revolut';

/**
 * Auto-detect exchange from CSV content and parse accordingly
 */
export function autoParseCSV(csvContent: string): ParseResult & { detectedExchange: ExchangeName } {
  const exchange = detectExchange(csvContent);

  let result: ParseResult;

  switch (exchange) {
    case 'binance':
      result = parseBinanceCSV(csvContent);
      break;
    case 'kraken':
      result = parseKrakenCSV(csvContent);
      break;
    case 'coinbase':
      result = parseCoinbaseCSV(csvContent);
      break;
    case 'revolut':
      result = parseRevolutCSV(csvContent);
      break;
    default: {
      // Try each parser and return the one with most successful parses
      const results = [
        parseBinanceCSV(csvContent),
        parseKrakenCSV(csvContent),
        parseCoinbaseCSV(csvContent),
        parseRevolutCSV(csvContent),
      ];
      result = results.sort((a, b) => b.transactions.length - a.transactions.length)[0];
      break;
    }
  }

  return { ...result, detectedExchange: exchange };
}

function detectExchange(csvContent: string): ExchangeName {
  const header = csvContent.split('\n').slice(0, 5).join('\n').toLowerCase();

  // Binance — current format (2025-2026): Base-Asset, Quote-Asset
  if (header.includes('base-asset') || header.includes('base asset')) {
    return 'binance';
  }
  // Binance — transaction history: Operation, Coin, Change
  if (header.includes('operation') && header.includes('coin') && header.includes('change')) {
    return 'binance';
  }
  // Binance — legacy: Pair + Side/Executed
  if (header.includes('pair') && (header.includes('side') || header.includes('executed'))) {
    return 'binance';
  }
  // Binance — order history: OrderNo
  if (header.includes('orderno') || header.includes('avgtrad')) {
    return 'binance';
  }

  // Kraken — trades: txid + ordertxid
  if (header.includes('txid') && header.includes('ordertxid')) {
    return 'kraken';
  }
  // Kraken — ledger: refid + aclass
  if (header.includes('refid') && header.includes('aclass')) {
    return 'kraken';
  }

  // Coinbase
  if (header.includes('transaction type') || header.includes('spot price at transaction')) {
    return 'coinbase';
  }
  if (header.includes('coinbase')) {
    return 'coinbase';
  }

  // Revolut — crypto transactions export: Symbol + Quantity + Total Amount is distinctive
  if (
    (header.includes('symbol') && header.includes('quantity') && header.includes('total amount')) ||
    header.includes('revolut')
  ) {
    return 'revolut';
  }

  return 'manual';
}
