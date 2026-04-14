import type { Transaction, ParseError, ExchangeName } from '../types';
import { formatEUR } from '../engine/tax-rules/france';

interface Props {
  transactions: Transaction[];
  errors: ParseError[];
  exchange: ExchangeName;
  usePrecisePrices: boolean;
  onTogglePrecisePrices: (value: boolean) => void;
  isFetchingPrices: boolean;
  priceProgress: { done: number; total: number; skippedOld: number };
  onCalculate: () => void;
  onBack: () => void;
}

export default function ReviewStep({ transactions, errors, exchange, usePrecisePrices, onTogglePrecisePrices, isFetchingPrices, priceProgress, onCalculate, onBack }: Props) {
  const exchangeNames: Record<ExchangeName, string> = {
    binance: 'Binance',
    kraken: 'Kraken',
    coinbase: 'Coinbase',
    kucoin: 'KuCoin',
    manual: 'Manuel',
  };

  const buys = transactions.filter((t) => t.type === 'buy');
  const sells = transactions.filter((t) => t.type === 'sell');
  const rewards = transactions.filter((t) => t.type === 'staking_reward' || t.type === 'airdrop');

  // Get unique assets
  const assets = new Set<string>();
  transactions.forEach((t) => {
    if (t.receivedAsset) assets.add(t.receivedAsset);
    if (t.sentAsset) assets.add(t.sentAsset);
  });
  // Remove fiat
  ['EUR', 'USD', 'USDT', 'USDC', 'BUSD', 'TUSD', 'FDUSD', 'BNB'].forEach((f) => assets.delete(f));

  // Get year range
  const years = transactions.map((t) => t.date.getFullYear());
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Exchange detecte" value={exchangeNames[exchange]} />
        <SummaryCard label="Transactions" value={transactions.length.toString()} />
        <SummaryCard label="Actifs" value={`${assets.size} crypto`} />
        <SummaryCard label="Periode" value={minYear === maxYear ? `${minYear}` : `${minYear}-${maxYear}`} />
      </div>

      {/* Transaction breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Achats</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{buys.length}</p>
        </div>
        <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Ventes</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{sells.length}</p>
        </div>
        <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Rewards</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{rewards.length}</p>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-8 p-4 rounded-lg bg-amber-900/20 border border-amber-700/50">
          <p className="text-sm font-medium text-amber-300 mb-2">
            {errors.length} ligne(s) n'ont pas pu etre analysees
          </p>
          <div className="max-h-32 overflow-y-auto">
            {errors.slice(0, 5).map((err, i) => (
              <p key={i} className="text-xs text-amber-400/70 mt-1">
                Ligne {err.row}: {err.message}
              </p>
            ))}
            {errors.length > 5 && (
              <p className="text-xs text-amber-400/50 mt-2">
                ... et {errors.length - 5} autres erreurs
              </p>
            )}
          </div>
        </div>
      )}

      {/* Transaction table */}
      <div className="mb-8 rounded-lg border border-gray-700 overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs text-gray-400 uppercase">Type</th>
                <th className="px-4 py-3 text-right text-xs text-gray-400 uppercase">Recu</th>
                <th className="px-4 py-3 text-right text-xs text-gray-400 uppercase">Envoye</th>
                <th className="px-4 py-3 text-right text-xs text-gray-400 uppercase">Frais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {transactions.slice(0, 50).map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-2 text-gray-300 whitespace-nowrap">
                    {tx.date.toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`
                      px-2 py-0.5 rounded text-xs font-medium
                      ${tx.type === 'buy' ? 'bg-emerald-900/50 text-emerald-300' : ''}
                      ${tx.type === 'sell' ? 'bg-red-900/50 text-red-300' : ''}
                      ${tx.type === 'staking_reward' ? 'bg-purple-900/50 text-purple-300' : ''}
                      ${tx.type === 'airdrop' ? 'bg-blue-900/50 text-blue-300' : ''}
                    `}>
                      {tx.type === 'buy' ? 'Achat' : tx.type === 'sell' ? 'Vente' : tx.type === 'staking_reward' ? 'Staking' : tx.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-gray-300">
                    {tx.receivedAmount.toFixed(4)} {tx.receivedAsset}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-300">
                    {tx.sentAmount > 0 ? `${formatEUR(tx.sentAmount)}` : '-'}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-500 text-xs">
                    {tx.feeAmount ? `${tx.feeAmount} ${tx.feeAsset}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length > 50 && (
            <p className="text-center text-xs text-gray-500 py-3">
              ... et {transactions.length - 50} autres transactions
            </p>
          )}
        </div>
      </div>

      {/* Price precision toggle */}
      <div className="mb-8 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-200">Prix historiques (Binance + CoinGecko)</p>
            <p className="text-xs text-gray-500 mt-1">
              {usePrecisePrices
                ? 'Utilise les vrais cours EUR via Binance (illimite) et CoinGecko (fallback). Plus precis mais necessite internet.'
                : 'Calcul hors-ligne avec des taux simplifies. Moins precis mais instantane.'}
            </p>
          </div>
          <button
            onClick={() => onTogglePrecisePrices(!usePrecisePrices)}
            className={`relative w-12 h-6 rounded-full transition-colors ${usePrecisePrices ? 'bg-blue-600' : 'bg-gray-600'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${usePrecisePrices ? 'translate-x-6.5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isFetchingPrices && (
        <div className="mb-8 p-6 rounded-lg bg-blue-900/20 border border-blue-700/50 text-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-blue-300">
            Recuperation des prix historiques...
          </p>
          {priceProgress.total > 0 && (
            <>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-3 max-w-xs mx-auto">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(priceProgress.done / priceProgress.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {priceProgress.done} / {priceProgress.total} prix recuperes
                {priceProgress.skippedOld > 0 && (
                  <span className="text-amber-400"> ({priceProgress.skippedOld} hors limite 365j — taux simplifies utilises)</span>
                )}
              </p>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onBack}
          disabled={isFetchingPrices}
          className="px-6 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Retour
        </button>
        <button
          onClick={onCalculate}
          disabled={transactions.length === 0 || isFetchingPrices}
          className="px-8 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFetchingPrices ? 'Chargement...' : 'Calculer mes impots'}
        </button>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-semibold text-gray-200 mt-1">{value}</p>
    </div>
  );
}
