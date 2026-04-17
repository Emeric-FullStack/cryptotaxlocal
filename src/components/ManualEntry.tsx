import { useState, useCallback } from 'react';
import type { Transaction, TransactionType } from '../types';

interface Props {
  onAddTransactions: (txs: Transaction[]) => void;
  existingCount: number;
}

interface ManualTx {
  date: string;
  type: TransactionType;
  asset: string;
  amount: string;
  priceEUR: string;
  feeAmount: string;
  feeAsset: string;
  exchange: string;
}

const EMPTY_TX: ManualTx = {
  date: new Date().toISOString().split('T')[0],
  type: 'buy',
  asset: 'BTC',
  amount: '',
  priceEUR: '',
  feeAmount: '',
  feeAsset: 'EUR',
  exchange: 'binance',
};

const COMMON_ASSETS = ['BTC', 'ETH', 'SOL', 'XRP', 'BNB', 'ADA', 'DOT', 'DOGE', 'AVAX', 'LINK', 'MATIC', 'UNI', 'ATOM', 'LTC'];
const EXCHANGES = ['binance', 'kraken', 'coinbase', 'kucoin', 'bybit', 'other'];
const TX_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'buy', label: 'Achat' },
  { value: 'sell', label: 'Vente' },
  { value: 'staking_reward', label: 'Staking reward' },
  { value: 'airdrop', label: 'Airdrop' },
];

export default function ManualEntry({ onAddTransactions, existingCount }: Props) {
  const [rows, setRows] = useState<ManualTx[]>([{ ...EMPTY_TX }]);
  const [errors, setErrors] = useState<string[]>([]);

  const addRow = () => {
    setRows([...rows, { ...EMPTY_TX }]);
  };

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const updateRow = (index: number, field: keyof ManualTx, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const validate = useCallback((): boolean => {
    const errs: string[] = [];
    rows.forEach((row, i) => {
      if (!row.date) errs.push(`Ligne ${i + 1}: date manquante`);
      if (!row.asset) errs.push(`Ligne ${i + 1}: actif manquant`);
      if (!row.amount || parseFloat(row.amount) <= 0) errs.push(`Ligne ${i + 1}: quantite invalide`);
      if (row.type === 'buy' || row.type === 'sell') {
        if (!row.priceEUR || parseFloat(row.priceEUR) <= 0) errs.push(`Ligne ${i + 1}: prix EUR manquant`);
      }
    });
    setErrors(errs);
    return errs.length === 0;
  }, [rows]);

  const handleSubmit = useCallback(() => {
    if (!validate()) return;

    const transactions: Transaction[] = rows.map((row, i) => {
      const amount = parseFloat(row.amount);
      const totalEUR = parseFloat(row.priceEUR || '0') * amount;
      const fee = parseFloat(row.feeAmount || '0');

      const base: Transaction = {
        id: `manual-${existingCount + i}-${Date.now()}`,
        date: new Date(row.date),
        type: row.type,
        receivedAsset: '',
        receivedAmount: 0,
        sentAsset: '',
        sentAmount: 0,
        feeAsset: row.feeAsset || 'EUR',
        feeAmount: fee,
        exchange: row.exchange,
      };

      switch (row.type) {
        case 'buy':
          base.receivedAsset = row.asset.toUpperCase();
          base.receivedAmount = amount;
          base.sentAsset = 'EUR';
          base.sentAmount = totalEUR;
          break;
        case 'sell':
          base.receivedAsset = 'EUR';
          base.receivedAmount = totalEUR;
          base.sentAsset = row.asset.toUpperCase();
          base.sentAmount = amount;
          break;
        case 'staking_reward':
        case 'airdrop':
          base.receivedAsset = row.asset.toUpperCase();
          base.receivedAmount = amount;
          base.sentAsset = '';
          base.sentAmount = 0;
          break;
      }

      return base;
    });

    onAddTransactions(transactions);
  }, [rows, existingCount, onAddTransactions, validate]);

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold text-white mb-4">Saisie manuelle</h3>
      <p className="text-sm text-gray-400 mb-6">
        Ajoutez vos transactions a la main si vous n'avez pas de fichier CSV.
      </p>

      {/* Transaction rows */}
      <div className="space-y-4">
        {rows.map((row, i) => (
          <div key={i} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-medium">Transaction {i + 1}</span>
              {rows.length > 1 && (
                <button onClick={() => removeRow(i)} className="text-xs text-red-400 hover:text-red-300">
                  Supprimer
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Date */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Date</label>
                <input
                  type="date"
                  value={row.date}
                  onChange={(e) => updateRow(i, 'date', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Type</label>
                <select
                  value={row.type}
                  onChange={(e) => updateRow(i, 'type', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  {TX_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Asset */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Crypto</label>
                <select
                  value={COMMON_ASSETS.includes(row.asset) ? row.asset : '__custom__'}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') return;
                    updateRow(i, 'asset', e.target.value);
                  }}
                  className="w-full px-2 py-1.5 text-sm bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  {COMMON_ASSETS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                  <option value="__custom__">Autre...</option>
                </select>
              </div>

              {/* Exchange */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Exchange</label>
                <select
                  value={row.exchange}
                  onChange={(e) => updateRow(i, 'exchange', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  {EXCHANGES.map((ex) => (
                    <option key={ex} value={ex}>{ex.charAt(0).toUpperCase() + ex.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Quantite</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.5"
                  value={row.amount}
                  onChange={(e) => updateRow(i, 'amount', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Price EUR (only for buy/sell) */}
              {(row.type === 'buy' || row.type === 'sell') && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Cours EUR (unitaire)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="42000"
                    value={row.priceEUR}
                    onChange={(e) => updateRow(i, 'priceEUR', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* Fee */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Frais</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={row.feeAmount}
                    onChange={(e) => updateRow(i, 'feeAmount', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={row.feeAsset}
                    onChange={(e) => updateRow(i, 'feeAsset', e.target.value)}
                    className="w-20 px-1 py-1.5 text-xs bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="EUR">EUR</option>
                    <option value="BNB">BNB</option>
                    <option value={row.asset}>{row.asset}</option>
                  </select>
                </div>
              </div>

              {/* Total display */}
              {(row.type === 'buy' || row.type === 'sell') && row.amount && row.priceEUR && (
                <div className="flex items-end">
                  <p className="text-sm text-gray-400 pb-1.5">
                    = <span className="text-white font-medium">
                      {(parseFloat(row.amount) * parseFloat(row.priceEUR)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} EUR
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add row */}
      <button
        onClick={addRow}
        className="mt-4 w-full py-2 rounded-lg border border-dashed border-gray-600 text-gray-400 text-sm hover:border-gray-500 hover:text-gray-300 transition-colors"
      >
        + Ajouter une transaction
      </button>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-red-900/20 border border-red-700/50">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-red-400">{err}</p>
          ))}
        </div>
      )}

      {/* Submit */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
        >
          Ajouter {rows.length} transaction{rows.length > 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}
