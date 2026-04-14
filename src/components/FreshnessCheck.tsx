import { useState, useEffect } from 'react';

/**
 * FreshnessCheck — Alerts users when tool, tax rules, or prices may be outdated
 */

const TAX_RULES_YEAR = 2026;
const MAX_AGE_DAYS = 90;
const PRICE_CACHE_PREFIX = 'cryptotaxlocal_price_';

// Build date is hardcoded at release time.
// Update this when publishing a new version.
const BUILD_DATE_STR = '2026-04-15';

interface Alert {
  type: 'warning' | 'critical';
  title: string;
  detail: string;
}

export default function FreshnessCheck() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const issues: Alert[] = [];
    const now = new Date();
    const buildDate = new Date(BUILD_DATE_STR);
    const ageInDays = Math.floor((now.getTime() - buildDate.getTime()) / (1000 * 60 * 60 * 24));

    if (ageInDays > MAX_AGE_DAYS) {
      issues.push({
        type: ageInDays > 180 ? 'critical' : 'warning',
        title: `Version agee de ${ageInDays} jours`,
        detail: 'Les taux fiscaux, formats CSV et regles de declaration peuvent avoir change. Mettez a jour depuis GitHub.',
      });
    }

    if (now.getFullYear() > TAX_RULES_YEAR) {
      issues.push({
        type: 'critical',
        title: `Regles fiscales de ${TAX_RULES_YEAR}`,
        detail: `Nous sommes en ${now.getFullYear()}. Les taux PFU, tranches IR et seuils ont peut-etre change. Verifiez sur impots.gouv.fr.`,
      });
    }

    if (now >= new Date('2026-07-01')) {
      issues.push({
        type: 'critical',
        title: 'Echanges crypto-crypto imposables',
        detail: 'Depuis le 1er juillet 2026, les echanges crypto-crypto sont imposables (ordonnance 2024-936). Cette version ne gere peut-etre pas ce changement.',
      });
    }

    const cacheKeys = Object.keys(localStorage).filter((k) => k.startsWith(PRICE_CACHE_PREFIX));
    if (cacheKeys.length > 500) {
      issues.push({
        type: 'warning',
        title: `${cacheKeys.length} prix en cache`,
        detail: 'Le cache de prix est volumineux. Pour liberer de l\'espace, videz les donnees du site dans les parametres de votre navigateur.',
      });
    }

    setAlerts(issues);
  }, []);

  if (alerts.length === 0 || dismissed) return null;

  const hasCritical = alerts.some((a) => a.type === 'critical');

  return (
    <div className={`mb-6 p-4 rounded-lg border ${hasCritical ? 'bg-red-900/20 border-red-700/50' : 'bg-amber-900/20 border-amber-700/50'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`text-xs mt-0.5 shrink-0 px-1.5 py-0.5 rounded font-bold ${
                alert.type === 'critical' ? 'bg-red-800 text-red-200' : 'bg-amber-800 text-amber-200'
              }`}>
                {alert.type === 'critical' ? 'CRITIQUE' : 'ATTENTION'}
              </span>
              <div>
                <p className={`text-sm font-medium ${alert.type === 'critical' ? 'text-red-300' : 'text-amber-300'}`}>
                  {alert.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{alert.detail}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-600">
            Build du {new Date(BUILD_DATE_STR).toLocaleDateString('fr-FR')}
            {' '} — <a href="https://github.com/Emeric-FullStack/cryptotaxlocal/releases" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Voir les mises a jour</a>
          </p>
        </div>
        <button onClick={() => setDismissed(true)} className="text-gray-500 hover:text-gray-300 shrink-0 p-1" aria-label="Fermer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
