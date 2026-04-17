import Papa from 'papaparse';
import type { Transaction, ParseResult, ParseError } from '../../types';

/**
 * Parse Revolut crypto transaction history CSV.
 *
 * Revolut provides several export shapes over time. The one we handle here is
 * the "Crypto transactions" CSV with columns roughly:
 *   Symbol, Date, Type, Quantity, Price, Value, Fees, Total Amount, Currency
 *
 * Fallbacks cover the older "Type, Started Date, Completed Date, Description,
 * Amount, Currency" account-statement format that also contains EXCHANGE rows
 * for crypto trades.
 *
 * NOTE (contributor): this parser is a STARTING POINT. It handles the two
 * most common shapes of Revolut CSV I've seen, but Revolut updates its export
 * format often. If you notice transactions being skipped or miscategorized,
 * please open an issue with an anonymized CSV sample — see
 * .github/ISSUE_TEMPLATE/exchange_request.yml.
 */
export function parseRevolutCSV(csvContent: string): ParseResult {
  const transactions: Transaction[] = [];
  const errors: ParseError[] = [];

  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors.length > 0) {
    parsed.errors.forEach((e) => {
      errors.push({ row: e.row ?? 0, message: e.message });
    });
  }

  const rows = parsed.data;

  for (let i = 0; i < rows.length; i++) {
    try {
      const tx = parseRevolutRow(rows[i], i);
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
    exchange: 'revolut',
    rowsParsed: rows.length,
  };
}

function parseRevolutRow(row: Record<string, string>, index: number): Transaction | null {
  // Shape A — "Crypto transactions" export (preferred)
  //   Symbol, Date, Type (BUY/SELL/EXCHANGE/REWARD), Quantity, Price, Value, Fees, Total Amount, Currency
  // Shape B — "Account statement" export
  //   Type, Started Date, Completed Date, Description, Amount, Currency, ...

  const dateStr =
    row['Date'] || row['Completed Date'] || row['Started Date'] || row['Timestamp'] || '';
  if (!dateStr) return null;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) throw new Error(`Invalid Revolut date: ${dateStr}`);

  const rawType = (row['Type'] || '').toUpperCase().trim();
  const symbol = (row['Symbol'] || row['Currency'] || '').toUpperCase().trim();
  const quantity = Math.abs(parseFloat(row['Quantity'] || row['Amount'] || '0'));
  const fiatCurrency = (row['Currency'] || 'EUR').toUpperCase();
  const price = parseFloat(row['Price'] || '0');
  const value = Math.abs(parseFloat(row['Value'] || row['Total Amount'] || '0'));
  const fee = parseFloat(row['Fees'] || row['Fee'] || '0');

  // Revolut "Crypto transactions" types
  switch (rawType) {
    case 'BUY':
      return {
        id: `revolut-${index}-${date.getTime()}`,
        date,
        type: 'buy',
        receivedAsset: symbol,
        receivedAmount: quantity,
        sentAsset: fiatCurrency,
        sentAmount: value || quantity * price,
        feeAsset: fiatCurrency,
        feeAmount: fee,
        exchange: 'revolut',
        originalRow: row,
      };

    case 'SELL':
      return {
        id: `revolut-${index}-${date.getTime()}`,
        date,
        type: 'sell',
        receivedAsset: fiatCurrency,
        receivedAmount: value || quantity * price,
        sentAsset: symbol,
        sentAmount: quantity,
        feeAsset: fiatCurrency,
        feeAmount: fee,
        exchange: 'revolut',
        originalRow: row,
      };

    case 'REWARD':
    case 'STAKING REWARD':
    case 'LEARN REWARD':
      return {
        id: `revolut-${index}-${date.getTime()}`,
        date,
        type: 'staking_reward',
        receivedAsset: symbol,
        receivedAmount: quantity,
        sentAsset: '',
        sentAmount: 0,
        exchange: 'revolut',
        originalRow: row,
      };

    case 'TRANSFER IN':
    case 'TRANSFER OUT':
    case 'DEPOSIT':
    case 'WITHDRAWAL':
      // Transfers are not taxable events on their own
      return null;

    default:
      // Unknown row type — skip silently. Parsers should never throw on
      // unrecognized rows; that would break CSVs that mix crypto and fiat tx.
      return null;
  }
}
