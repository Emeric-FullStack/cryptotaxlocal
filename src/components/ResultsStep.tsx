import { useState } from 'react';
import type { TaxSummary, TaxMode, TaxableEvent } from '../types';
import { formatEUR, FRANCE_TAX_RULES } from '../engine/tax-rules/france';

interface Props {
  summary: TaxSummary;
  availableYears: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  onTaxModeChange: (mode: TaxMode, otherIncome: number) => void;
  onEventPriceChange?: (eventId: string, newUnitPrice: number) => void;
  onExportPDF: () => void;
  onBack: () => void;
}

export default function ResultsStep({ summary, availableYears, selectedYear, onYearChange, onTaxModeChange, onEventPriceChange, onExportPDF, onBack }: Props) {
  const [otherIncome, setOtherIncome] = useState<string>('');
  const [showProgressiveHelp, setShowProgressiveHelp] = useState(false);

  const handleModeChange = (mode: TaxMode) => {
    onTaxModeChange(mode, mode === 'progressive' ? (parseFloat(otherIncome) || 0) : 0);
  };

  const handleOtherIncomeChange = (value: string) => {
    setOtherIncome(value);
    const num = parseFloat(value) || 0;
    if (summary.taxMode === 'progressive') {
      onTaxModeChange('progressive', num);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Year selector */}
      {availableYears.length > 1 && (
        <div className="flex gap-2 justify-center mb-8">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => onYearChange(year)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                year === selectedYear
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      )}

      {/* Tax mode selector */}
      <div className="mb-8 p-5 rounded-xl bg-gray-800/50 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Mode d'imposition</h3>
          <button
            onClick={() => setShowProgressiveHelp(!showProgressiveHelp)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {showProgressiveHelp ? 'Masquer l\'aide' : 'Quelle option choisir ?'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => handleModeChange('flat_tax')}
            className={`p-4 rounded-lg border text-left transition-all ${
              summary.taxMode === 'flat_tax'
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                summary.taxMode === 'flat_tax' ? 'border-blue-500' : 'border-gray-600'
              }`}>
                {summary.taxMode === 'flat_tax' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
              </div>
              <span className="text-sm font-medium text-white">Flat Tax (PFU)</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-600/30 text-blue-300">31,4%</span>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              IR 12,8% + prelevements sociaux 18,6%. Choix par defaut, le plus simple.
            </p>
          </button>

          <button
            onClick={() => handleModeChange('progressive')}
            className={`p-4 rounded-lg border text-left transition-all ${
              summary.taxMode === 'progressive'
                ? 'border-emerald-500 bg-emerald-900/20'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                summary.taxMode === 'progressive' ? 'border-emerald-500' : 'border-gray-600'
              }`}>
                {summary.taxMode === 'progressive' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
              </div>
              <span className="text-sm font-medium text-white">Bareme progressif</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-600/30 text-emerald-300">Case 3CN</span>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              IR au bareme + prelevements sociaux 18,6%. Avantageux si TMI &lt; 12,8%.
            </p>
          </button>
        </div>

        {/* Other income field for progressive */}
        {summary.taxMode === 'progressive' && (
          <div className="mt-4 p-4 rounded-lg bg-gray-900/50 border border-gray-700">
            <label className="block text-sm text-gray-300 mb-2">
              Autres revenus nets imposables (salaire, etc.)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={otherIncome}
                onChange={(e) => handleOtherIncomeChange(e.target.value)}
                placeholder="Ex: 30000"
                className="w-48 px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <span className="text-sm text-gray-500">EUR/an</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Necessaire pour calculer votre tranche marginale. Laissez vide ou 0 si vous n'avez pas d'autres revenus.
            </p>
          </div>
        )}

        {/* Help section */}
        {showProgressiveHelp && (
          <div className="mt-4 p-4 rounded-lg bg-blue-900/10 border border-blue-800/30 text-sm text-gray-300">
            <p className="font-medium text-white mb-2">Comment choisir ?</p>
            <p>
              Le <strong className="text-blue-300">bareme progressif</strong> est plus avantageux si
              votre taux marginal d'imposition (TMI) est inferieur a 12,8%. En pratique, c'est le cas si
              votre revenu imposable total (salaire + crypto) vous place dans la tranche a 0% ou 11%.
            </p>
            <div className="mt-3 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-400">Tranche de revenu (1 part)</th>
                    <th className="px-3 py-2 text-right text-gray-400">Taux IR</th>
                    <th className="px-3 py-2 text-right text-gray-400">Meilleur choix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {FRANCE_TAX_RULES.progressiveBrackets.slice(0, 4).map((bracket, i) => {
                    const prev = i > 0 ? FRANCE_TAX_RULES.progressiveBrackets[i - 1].upTo : 0;
                    const best = bracket.rate < 0.128 ? 'Progressif' : bracket.rate === 0.128 ? 'Equivalent' : 'Flat Tax';
                    const bestColor = bracket.rate < 0.128 ? 'text-emerald-400' : bracket.rate === 0.128 ? 'text-gray-400' : 'text-blue-400';
                    return (
                      <tr key={i}>
                        <td className="px-3 py-1.5 text-gray-300">
                          {formatEUR(prev)} - {bracket.upTo === Infinity ? '...' : formatEUR(bracket.upTo)}
                        </td>
                        <td className="px-3 py-1.5 text-right text-gray-300">{(bracket.rate * 100).toFixed(0)}%</td>
                        <td className={`px-3 py-1.5 text-right font-medium ${bestColor}`}>{best}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Attention : les prelevements sociaux de 18,6% s'appliquent toujours, quel que soit le mode choisi.
              Ce tableau est pour 1 part fiscale (celibataire). Le quotient familial change les seuils.
            </p>
          </div>
        )}
      </div>

      {/* Exemption notice */}
      {summary.isExempt && (
        <div className="mb-8 p-4 rounded-lg bg-emerald-900/20 border border-emerald-700/50">
          <p className="text-sm text-emerald-300">
            <strong>Exoneration :</strong> Le total de vos cessions ({formatEUR(summary.totalProceeds)})
            est inferieur au seuil de 305 EUR. Vos gains sont exoneres d'impot.
            Le formulaire 2086 reste obligatoire.
          </p>
        </div>
      )}

      {/* Main result card */}
      <div className="p-8 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-lg text-gray-400">Impot estime pour {summary.year}</h2>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400">
            {summary.taxMode === 'flat_tax' ? 'PFU 31,4%' : 'Bareme progressif'}
          </span>
        </div>
        <p className={`text-5xl font-bold ${summary.taxDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
          {formatEUR(summary.taxDue)}
        </p>
        {summary.effectiveRate > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Taux effectif : {(summary.effectiveRate * 100).toFixed(1)}%
          </p>
        )}
        {summary.netGainLoss <= 0 && !summary.isExempt && (
          <p className="text-emerald-400 text-sm mt-2">
            Pas d'impot a payer — moins-value nette de {formatEUR(Math.abs(summary.netGainLoss))}
          </p>
        )}
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <ResultCard
          label="Plus-values"
          value={formatEUR(summary.totalGain)}
          color="text-emerald-400"
          detail={`${summary.events.filter(e => e.gainLoss > 0).length} operations`}
        />
        <ResultCard
          label="Moins-values"
          value={formatEUR(summary.totalLoss)}
          color="text-red-400"
          detail={`${summary.events.filter(e => e.gainLoss < 0).length} operations`}
        />
        <ResultCard
          label="Gain net imposable"
          value={formatEUR(summary.netGainLoss)}
          color={summary.netGainLoss >= 0 ? 'text-blue-400' : 'text-emerald-400'}
        />
      </div>

      {/* Tax breakdown */}
      <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700 mb-8">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
          Decomposition de l'impot ({summary.taxMode === 'flat_tax' ? 'Flat Tax 31,4%' : 'Bareme progressif + PS 18,6%'})
        </h3>
        <div className="space-y-3">
          <TaxLine
            label={summary.taxMode === 'flat_tax' ? 'Impot sur le revenu (12,8%)' : `Impot sur le revenu (bareme)`}
            value={formatEUR(summary.incomeTaxPart)}
          />
          <TaxLine
            label="Prelevements sociaux (18,6%)"
            value={formatEUR(summary.socialChargesPart)}
          />
          <div className="pt-3 border-t border-gray-700 flex justify-between">
            <span className="font-medium text-gray-200">Total a payer</span>
            <span className="font-bold text-lg text-white">{formatEUR(summary.taxDue)}</span>
          </div>
        </div>
      </div>

      {/* Events table */}
      <div className="mb-8 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-4 py-3 bg-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Detail des operations imposables ({summary.events.length})
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Binance/CoinGecko
            <span className="w-2 h-2 rounded-full bg-gray-500 inline-block" /> CSV
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Manuel
          </div>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Date</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Actif</th>
                <th className="px-3 py-2 text-right text-xs text-gray-500">Quantite</th>
                <th className="px-3 py-2 text-right text-xs text-gray-500">
                  <Tooltip text="Cours unitaire EUR au moment de la cession. Source : Binance API ou CoinGecko (fallback). Cliquable pour ajuster.">Cours EUR</Tooltip>
                </th>
                <th className="px-3 py-2 text-right text-xs text-gray-500">
                  <Tooltip text="Frais de transaction (commission exchange + gas fees). Deduits du prix de cession (BOFIP BOI-RPPM-PVBMC-30-20).">Frais</Tooltip>
                </th>
                <th className="px-3 py-2 text-right text-xs text-gray-500">
                  <Tooltip text="Prix de cession net = prix brut - frais. C'est ce montant qui entre dans la formule de plus-value.">Cession nette</Tooltip>
                </th>
                <th className="px-3 py-2 text-right text-xs text-gray-500">
                  <Tooltip text="Prix d'acquisition calcule en FIFO (First In, First Out) : les lots les plus anciens sont utilises en premier.">Acquisition</Tooltip>
                </th>
                <th className="px-3 py-2 text-right text-xs text-gray-500">
                  <Tooltip text="Plus ou moins-value = Cession nette - Acquisition. Imposable au PFU 31,4% ou bareme progressif.">+/- Value</Tooltip>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {summary.events.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  onPriceChange={onEventPriceChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulaire 2086 info */}
      <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-700/50 mb-8">
        <p className="text-sm text-blue-300">
          <strong>Formulaire 2086 :</strong> Ces montants sont a reporter sur le formulaire 2086
          de votre declaration de revenus. Le prix de cession total est de {formatEUR(summary.totalProceeds)}.
          {summary.taxMode === 'progressive' && ' Cochez la case 3CN pour opter pour le bareme progressif.'}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50 mb-8">
        <p className="text-xs text-gray-500">
          <strong>Avertissement :</strong> Cet outil fournit une estimation indicative.
          Il ne constitue pas un conseil fiscal. Les calculs utilisent la formule de l'article 150 VH bis (PA global decremente) avec
          des taux de change simplifies. Le calcul du bareme progressif est simplifie (1 part fiscale,
          sans decotes ni reductions). Pour une declaration fiscale precise, consultez un
          expert-comptable specialise en cryptomonnaies.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
        >
          Modifier les donnees
        </button>
        <button
          onClick={onExportPDF}
          className="px-8 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exporter en PDF
        </button>
      </div>
    </div>
  );
}

function EventRow({ event, onPriceChange }: { event: TaxableEvent; onPriceChange?: (eventId: string, newUnitPrice: number) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(event.unitPriceEUR.toFixed(2));

  const sourceColor = event.priceSource === 'coingecko' ? 'bg-blue-500' : event.priceSource === 'manual' ? 'bg-amber-500' : 'bg-gray-500';

  const handleSubmit = () => {
    const newPrice = parseFloat(editValue);
    if (!isNaN(newPrice) && newPrice > 0 && onPriceChange) {
      onPriceChange(event.id, newPrice);
    }
    setIsEditing(false);
  };

  return (
    <tr className="hover:bg-gray-800/30">
      <td className="px-3 py-2 text-gray-300 whitespace-nowrap text-xs">
        {event.date.toLocaleDateString('fr-FR')}
      </td>
      <td className="px-3 py-2 text-gray-300 font-medium">{event.asset}</td>
      <td className="px-3 py-2 text-right text-gray-400">
        {event.amountSold.toFixed(4)}
      </td>
      <td className="px-3 py-2 text-right">
        <div className="flex items-center justify-end gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${sourceColor} shrink-0`} title={event.priceSource} />
          {isEditing ? (
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-24 px-1 py-0.5 text-right text-xs bg-gray-700 border border-blue-500 rounded text-white focus:outline-none"
              autoFocus
            />
          ) : (
            <button
              onClick={() => { setEditValue(event.unitPriceEUR.toFixed(2)); setIsEditing(true); }}
              className="text-gray-400 hover:text-white text-xs cursor-pointer hover:bg-gray-700/50 px-1 py-0.5 rounded transition-colors"
              title="Cliquez pour ajuster le cours"
            >
              {formatEUR(event.unitPriceEUR)}
            </button>
          )}
        </div>
      </td>
      <td className="px-3 py-2 text-right text-xs">
        {event.feesEUR > 0 ? (
          <span className="text-amber-400" title={`Frais deduits du prix de cession`}>
            -{formatEUR(event.feesEUR)}
          </span>
        ) : (
          <span className="text-gray-600">-</span>
        )}
      </td>
      <td className="px-3 py-2 text-right text-gray-300 text-xs" title={event.feesEUR > 0 ? `Brut: ${formatEUR(event.proceedsEUR)} - Frais: ${formatEUR(event.feesEUR)}` : ''}>
        {formatEUR(event.netProceedsEUR)}
      </td>
      <td className="px-3 py-2 text-right text-gray-400 text-xs">
        {formatEUR(event.costBasisEUR)}
      </td>
      <td className={`px-3 py-2 text-right font-medium text-xs ${
        event.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
      }`}>
        {event.gainLoss >= 0 ? '+' : ''}{formatEUR(event.gainLoss)}
      </td>
    </tr>
  );
}

function ResultCard({ label, value, color, detail }: { label: string; value: string; color: string; detail?: string }) {
  return (
    <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
      {detail && <p className="text-xs text-gray-500 mt-1">{detail}</p>}
    </div>
  );
}

function TaxLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
}

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <span className="relative group cursor-help">
      <span className="border-b border-dashed border-gray-600">{children}</span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-gray-200 bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-56 text-left leading-relaxed z-50">
        {text}
      </span>
    </span>
  );
}
