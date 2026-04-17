import Papa from 'papaparse';
import type { Transaction, ParseResult, ParseError } from '../../types';

/**
 * Parse Coinbase transaction history CSV
 * Coinbase columns: Timestamp, Transaction Type, Asset, Quantity Transacted,
 * Spot Price Currency, Spot Price at Transaction, Subtotal, Total (inclusive of fees and/or spread), Fees and/or Spread, Notes
 */
export function parseCoinbaseCSV(csvContent: string): ParseResult {
  const transactions: Transaction[] = [];
  const errors: ParseError[] = [];

  // Coinbase CSVs often have metadata rows at the top — skip lines until we find headers
  const lines = csvContent.split('\n');
  let headerIndex = lines.findIndex(
    (line) => line.includes('Timestamp') && line.includes('Transaction Type')
  );
  if (headerIndex === -1) {
    // Try alternate header format
    headerIndex = lines.findIndex((line) => line.includes('timestamp') || line.includes('Date'));
  }

  const cleanCSV = headerIndex > 0 ? lines.slice(headerIndex).join('\n') : csvContent;

  const parsed = Papa.parse(cleanCSV, {
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

  for (let i = 0; i < rows.length; i++) {
    try {
      const row = rows[i];
      const tx = parseCoinbaseRow(row, i);
      if (tx) transactions.push(tx);
    } catch (e) {
      errors.push({
        row: i + 2 + headerIndex,
        message: e instanceof Error ? e.message : 'Unknown parsing error',
        data: rows[i],
      });
    }
  }

  return {
    transactions: transactions.sort((a, b) => a.date.getTime() - b.date.getTime()),
    errors,
    exchange: 'coinbase',
    rowsParsed: rows.length,
  };
}

function parseCoinbaseRow(row: Record<string, string>, index: number): Transaction | null {
  const dateStr = row['Timestamp'] || row['Date'] || '';
  if (!dateStr) return null;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) throw new Error(`Invalid date: ${dateStr}`);

  const txType = (row['Transaction Type'] || row['Type'] || '').toLowerCase();
  const asset = row['Asset'] || row['Currency'] || '';
  const quantity = Math.abs(parseFloat(row['Quantity Transacted'] || row['Amount'] || '0'));
  const spotPrice = parseFloat(row['Spot Price at Transaction'] || row['Spot Price'] || '0');
  const currency = row['Spot Price Currency'] || 'EUR';
  // IMPORTANT: Coinbase a deux colonnes de montant :
  // - "Subtotal" = montant HORS frais (ce que tu recois vraiment sur un sell)
  // - "Total (inclusive of fees and/or spread)" = montant TTC
  // On utilise Subtotal pour eviter de compter les frais deux fois
  const subtotal = Math.abs(parseFloat(row['Subtotal'] || '0'));
  const total = Math.abs(parseFloat(row['Total (inclusive of fees and/or spread)'] || row['Total'] || '0')) || (quantity * spotPrice);
  const fee = parseFloat(row['Fees and/or Spread'] || row['Fee'] || '0');

  if (!asset || quantity === 0) return null;

  let type: 'buy' | 'sell' | 'staking_reward' | 'airdrop';
  let receivedAsset = asset;
  let receivedAmount = quantity;
  let sentAsset = currency;
  let sentAmount: number;

  switch (txType) {
    case 'buy':
    case 'advanced trade buy':
      type = 'buy';
      // Pour un achat, sentAmount = total (ce que tu paies, frais inclus)
      // Les frais d'achat augmentent le cout d'acquisition
      sentAmount = total;
      break;
    case 'sell':
    case 'advanced trade sell':
      type = 'sell';
      receivedAsset = currency;
      // Pour une vente, receivedAmount = subtotal (hors frais)
      // Les frais sont separes et seront deduits dans le calcul FIFO
      receivedAmount = subtotal > 0 ? subtotal : (total - fee);
      sentAsset = asset;
      sentAmount = quantity;
      break;
    case 'staking income':
    case 'rewards income':
    case 'earning':
      type = 'staking_reward';
      sentAsset = '';
      sentAmount = 0;
      break;
    case 'receive':
    case 'airdrop':
      type = 'airdrop';
      sentAsset = '';
      sentAmount = 0;
      break;
    case 'send':
      // Sends are not taxable events by themselves
      return null;
    case 'convert':
      type = 'sell'; // Treat conversions as sell then buy
      receivedAsset = currency;
      receivedAmount = total;
      sentAsset = asset;
      sentAmount = quantity;
      break;
    default:
      // Skip unknown transaction types
      return null;
  }

  return {
    id: `coinbase-${index}-${date.getTime()}`,
    date,
    type,
    receivedAsset,
    receivedAmount,
    sentAsset,
    sentAmount,
    feeAsset: currency,
    feeAmount: fee,
    exchange: 'coinbase',
    originalRow: row,
  };
}
