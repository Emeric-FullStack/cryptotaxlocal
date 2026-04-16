import { useState, useRef, useCallback, useMemo } from 'react';
import { calculateFlatTax, calculateProgressiveTax, formatEUR } from '../../engine/tax-rules/france';

interface Props {
  onBack: () => void;
}

export default function Simulateur({ onBack }: Props) {
  const [gainAmount, setGainAmount] = useState(5000);
  const [otherIncome, setOtherIncome] = useState(25000);
  const [totalProceeds, setTotalProceeds] = useState(15000);
  const cardRef = useRef<HTMLDivElement>(null);

  // Calculs
  const flatTax = useMemo(() => calculateFlatTax(gainAmount, totalProceeds), [gainAmount, totalProceeds]);
  const progressive = useMemo(() => calculateProgressiveTax(gainAmount, totalProceeds, otherIncome), [gainAmount, totalProceeds, otherIncome]);

  const bestOption = flatTax.taxDue <= progressive.taxDue ? 'flat' : 'progressive';
  const savings = Math.abs(flatTax.taxDue - progressive.taxDue);
  const netAfterTax = gainAmount - Math.min(flatTax.taxDue, progressive.taxDue);

  // Ancien taux 2024 (30%) pour comparaison
  const oldTaxDue = gainAmount > 0 && totalProceeds > 305 ? gainAmount * 0.30 : 0;
  const csgIncrease = flatTax.taxDue - oldTaxDue;

  // Export image
  const generateShareImage = useCallback(async () => {
    const canvas = document.createElement('canvas');
    const w = 1200;
    const h = 630;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#0f1117');
    gradient.addColorStop(1, '#1a1b2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px system-ui, sans-serif';
    ctx.fillText('Mon estimation crypto 2026', 60, 90);

    // Subtitle
    ctx.fillStyle = '#9ca3af';
    ctx.font = '22px system-ui, sans-serif';
    ctx.fillText(`Gain de ${formatEUR(gainAmount)} sur ${formatEUR(totalProceeds)} de cessions`, 60, 130);

    // Big number
    const bestTax = Math.min(flatTax.taxDue, progressive.taxDue);
    ctx.fillStyle = bestTax > 0 ? '#ef4444' : '#10b981';
    ctx.font = 'bold 80px system-ui, sans-serif';
    ctx.fillText(formatEUR(bestTax), 60, 240);
    ctx.fillStyle = '#6b7280';
    ctx.font = '28px system-ui, sans-serif';
    ctx.fillText('d\'impot a payer', 60, 280);

    // Comparison boxes
    const boxY = 320;

    // Flat tax box
    ctx.fillStyle = bestOption === 'flat' ? '#1e3a5f' : '#1f2937';
    ctx.beginPath();
    ctx.roundRect(60, boxY, 500, 120, 12);
    ctx.fill();
    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('Flat Tax (PFU) 31,4%', 80, boxY + 35);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.fillText(formatEUR(flatTax.taxDue), 80, boxY + 85);
    if (bestOption === 'flat') {
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText('MEILLEUR CHOIX', 350, boxY + 35);
    }

    // Progressive box
    ctx.fillStyle = bestOption === 'progressive' ? '#1a3a2e' : '#1f2937';
    ctx.beginPath();
    ctx.roundRect(620, boxY, 520, 120, 12);
    ctx.fill();
    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('Bareme progressif (case 3CN)', 640, boxY + 35);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.fillText(formatEUR(progressive.taxDue), 640, boxY + 85);
    if (bestOption === 'progressive') {
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText('MEILLEUR CHOIX', 930, boxY + 35);
    }

    // Net after tax
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.roundRect(60, 470, 1080, 60, 12);
    ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText(`Il vous reste ${formatEUR(netAfterTax)} apres impot`, 80, 510);
    if (savings > 0) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = '20px system-ui, sans-serif';
      ctx.fillText(`Economie de ${formatEUR(savings)} en choisissant le ${bestOption === 'flat' ? 'PFU' : 'bareme'}`, 640, 510);
    }

    // Footer
    ctx.fillStyle = '#4b5563';
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillText('Simulation indicative — cryptotaxlocal.com', 60, 590);
    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('cryptotaxlocal.com', 820, 590);

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crypto-tax-simulation-${gainAmount}EUR.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, [gainAmount, totalProceeds, flatTax, progressive, bestOption, savings, netAfterTax]);

  // Share on Twitter
  const shareTwitter = useCallback(() => {
    const bestTax = Math.min(flatTax.taxDue, progressive.taxDue);
    const text = encodeURIComponent(
      `Simulation impot crypto 2026 :\n\n` +
      `Gain : ${formatEUR(gainAmount)}\n` +
      `Impot : ${formatEUR(bestTax)} (${bestOption === 'flat' ? 'PFU 31,4%' : 'bareme progressif'})\n` +
      `Il me reste : ${formatEUR(netAfterTax)}\n\n` +
      `Calculez le votre gratuitement :`
    );
    const url = encodeURIComponent('https://cryptotaxlocal.com');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }, [gainAmount, flatTax, progressive, bestOption, netAfterTax]);

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="text-sm text-blue-400 hover:text-blue-300 mb-6 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Retour
      </button>

      <h1 className="text-3xl font-bold text-white mb-2">Simulateur d'impot crypto 2026</h1>
      <p className="text-gray-400 mb-8">Estimez votre impot en temps reel — PFU 31,4% vs bareme progressif</p>

      {/* Sliders */}
      <div className="space-y-6 mb-10">
        <SliderField
          label="Total des cessions (prix de vente)"
          value={totalProceeds}
          onChange={setTotalProceeds}
          min={0}
          max={200000}
          step={500}
          format={formatEUR}
          hint="Montant total de vos ventes crypto dans l'annee"
        />
        <SliderField
          label="Plus-value nette (gain)"
          value={gainAmount}
          onChange={setGainAmount}
          min={-50000}
          max={100000}
          step={250}
          format={formatEUR}
          hint="Gain total apres deduction du prix d'acquisition et des frais"
          color={gainAmount >= 0 ? 'emerald' : 'red'}
        />
        <SliderField
          label="Autres revenus annuels (salaire, etc.)"
          value={otherIncome}
          onChange={setOtherIncome}
          min={0}
          max={150000}
          step={1000}
          format={formatEUR}
          hint="Necessaire pour calculer le bareme progressif"
        />
      </div>

      {/* Exemption notice */}
      {totalProceeds <= 305 && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-900/20 border border-emerald-700/50">
          <p className="text-sm text-emerald-300">
            <strong>Exonere :</strong> Vos cessions ({formatEUR(totalProceeds)}) sont inferieures a 305 EUR. Pas d'impot.
          </p>
        </div>
      )}

      {/* Results card */}
      <div ref={cardRef} className="p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 mb-6">
        {/* Big number */}
        <p className="text-gray-400 text-sm mb-1">Impot estime (meilleure option)</p>
        <p className={`text-5xl font-bold ${Math.min(flatTax.taxDue, progressive.taxDue) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
          {formatEUR(Math.min(flatTax.taxDue, progressive.taxDue))}
        </p>
        {gainAmount > 0 && !flatTax.isExempt && (
          <p className="text-sm text-gray-500 mt-1">
            soit {((Math.min(flatTax.taxDue, progressive.taxDue) / gainAmount) * 100).toFixed(1)}% de votre gain
          </p>
        )}

        {/* Comparison */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className={`p-4 rounded-lg border ${bestOption === 'flat' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-800/50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-blue-300">PFU 31,4%</span>
              {bestOption === 'flat' && <span className="text-xs px-2 py-0.5 rounded bg-emerald-600 text-white">Meilleur</span>}
            </div>
            <p className="text-2xl font-bold text-white">{formatEUR(flatTax.taxDue)}</p>
            <p className="text-xs text-gray-500 mt-1">IR {formatEUR(flatTax.incomeTax)} + PS {formatEUR(flatTax.socialCharges)}</p>
          </div>
          <div className={`p-4 rounded-lg border ${bestOption === 'progressive' ? 'border-emerald-500 bg-emerald-900/20' : 'border-gray-700 bg-gray-800/50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-emerald-300">Bareme progressif</span>
              {bestOption === 'progressive' && <span className="text-xs px-2 py-0.5 rounded bg-emerald-600 text-white">Meilleur</span>}
            </div>
            <p className="text-2xl font-bold text-white">{formatEUR(progressive.taxDue)}</p>
            <p className="text-xs text-gray-500 mt-1">IR {formatEUR(progressive.incomeTax)} + PS {formatEUR(progressive.socialCharges)}</p>
          </div>
        </div>

        {/* Savings */}
        {savings > 1 && (
          <div className="mt-4 p-3 rounded-lg bg-amber-900/20 border border-amber-700/50">
            <p className="text-sm text-amber-300">
              Vous economisez <strong>{formatEUR(savings)}</strong> en choisissant le {bestOption === 'flat' ? 'PFU' : 'bareme progressif (case 3CN)'}.
            </p>
          </div>
        )}

        {/* Waterfall */}
        <div className="mt-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Decomposition</p>
          <div className="space-y-2">
            <WaterfallBar label="Gain brut" value={gainAmount} max={gainAmount} color="emerald" />
            <WaterfallBar label="Impot" value={-Math.min(flatTax.taxDue, progressive.taxDue)} max={gainAmount} color="red" />
            <WaterfallBar label="Il vous reste" value={netAfterTax} max={gainAmount} color="blue" />
          </div>
        </div>

        {/* 2024 vs 2026 comparison */}
        {gainAmount > 0 && !flatTax.isExempt && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              Avec l'ancien taux 2024 (30%) : {formatEUR(oldTaxDue)} —
              {csgIncrease > 0 ? (
                <span className="text-red-400"> vous payez {formatEUR(csgIncrease)} de plus en 2026 (hausse CSG)</span>
              ) : (
                <span className="text-emerald-400"> meme montant</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Share buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={generateShareImage}
          className="px-4 py-2 rounded-lg bg-gray-700 text-white text-sm hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Telecharger l'image
        </button>
        <button
          onClick={shareTwitter}
          className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-500 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          Partager sur X
        </button>
        <button
          onClick={() => {
            const text = encodeURIComponent(`Simulation impot crypto 2026 : ${formatEUR(Math.min(flatTax.taxDue, progressive.taxDue))} d'impot sur ${formatEUR(gainAmount)} de gain. Calculez le votre gratuitement sur cryptotaxlocal.com`);
            window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}&u=${encodeURIComponent('https://cryptotaxlocal.com')}`, '_blank');
          }}
          className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Facebook
        </button>
        <button
          onClick={() => {
            const text = encodeURIComponent(`Simulation impot crypto 2026 : ${formatEUR(Math.min(flatTax.taxDue, progressive.taxDue))} d'impot sur ${formatEUR(gainAmount)} de gain.\n\nCalculez le votre gratuitement : https://cryptotaxlocal.com`);
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://cryptotaxlocal.com')}&summary=${text}`, '_blank');
          }}
          className="px-4 py-2 rounded-lg bg-blue-800 text-white text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          LinkedIn
        </button>
      </div>

      {/* CTA */}
      <div className="p-6 rounded-xl bg-blue-900/20 border border-blue-700/30 text-center">
        <p className="text-blue-300 text-sm mb-3">
          Cette simulation est indicative. Pour un calcul precis avec vos vraies transactions :
        </p>
        <button onClick={onBack} className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors">
          Calculer avec mes donnees CSV
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-600 mt-6 text-center">
        Simulation indicative basee sur les taux PFU 31,4% (IR 12,8% + PS 18,6%) et le bareme progressif 2026.
        Ne constitue pas un conseil fiscal. Le bareme progressif est simplifie (1 part, sans decotes).
      </p>
    </div>
  );
}

// ================================================
// Sub-components
// ================================================

function SliderField({ label, value, onChange, min, max, step, format, hint, color = 'blue' }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  hint?: string;
  color?: 'blue' | 'emerald' | 'red';
}) {
  const colorMap = {
    blue: 'accent-blue-500',
    emerald: 'accent-emerald-500',
    red: 'accent-red-500',
  };

  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <label className="text-sm text-gray-300">{label}</label>
        <span className={`text-lg font-bold ${value >= 0 ? 'text-white' : 'text-red-400'}`}>{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer ${colorMap[color]}`}
      />
      {hint && <p className="text-xs text-gray-600 mt-1">{hint}</p>}
    </div>
  );
}

function WaterfallBar({ label, value, max, color }: {
  label: string;
  value: number;
  max: number;
  color: 'emerald' | 'red' | 'blue';
}) {
  const pct = max > 0 ? Math.min(Math.abs(value) / max * 100, 100) : 0;
  const colorMap = {
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-24 text-right">{label}</span>
      <div className="flex-1 h-6 bg-gray-800 rounded overflow-hidden">
        <div className={`h-full ${colorMap[color]} rounded transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-medium w-24 ${value >= 0 ? 'text-gray-300' : 'text-red-400'}`}>
        {value >= 0 ? '' : '-'}{formatEUR(Math.abs(value))}
      </span>
    </div>
  );
}
