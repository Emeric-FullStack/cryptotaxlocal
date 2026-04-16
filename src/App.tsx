import { useState, useCallback, useMemo } from 'react';
import ImportStep from './components/ImportStep';
import ReviewStep from './components/ReviewStep';
import ResultsStep from './components/ResultsStep';
import MentionsLegales from './components/legal/MentionsLegales';
import PolitiqueConfidentialite from './components/legal/PolitiqueConfidentialite';
import CGU from './components/legal/CGU';
import GuideFiscalCrypto from './components/pages/GuideFiscalCrypto';
import ComparatifOutils from './components/pages/ComparatifOutils';
import Guide3916bis from './components/pages/Guide3916bis';
import Simulateur from './components/pages/Simulateur';
import FreshnessCheck from './components/FreshnessCheck';
import DonationTransparency from './components/DonationTransparency';
import { FIFOCalculator, generateTaxSummary } from './engine/calculator/fifo';
import { exportTaxReportPDF } from './engine/export/pdf';
import { prefetchPrices } from './engine/prices';
import type { PriceMap } from './engine/prices';
import type { Transaction, ParseError, ExchangeName, AppStep, TaxSummary, TaxableEvent, TaxMode } from './types';

type Page = 'app' | 'mentions' | 'confidentialite' | 'cgu' | 'guide' | 'comparatif' | 'guide3916bis' | 'simulateur';

function App() {
  const [page, setPage] = useState<Page>('app');
  const [step, setStep] = useState<AppStep>('import');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
  const [exchange, setExchange] = useState<ExchangeName>('manual');
  const [taxEvents, setTaxEvents] = useState<TaxableEvent[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [taxMode, setTaxMode] = useState<TaxMode>('flat_tax');
  const [otherIncome, setOtherIncome] = useState<number>(0);
  const [, setPriceMap] = useState<PriceMap>(new Map());
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);
  const [priceProgress, setPriceProgress] = useState({ done: 0, total: 0, skippedOld: 0 });
  const [usePrecisePrices, setUsePrecisePrices] = useState(true);

  const handleImport = useCallback((txs: Transaction[], errors: ParseError[], ex: ExchangeName) => {
    setTransactions(txs);
    setParseErrors(errors);
    setExchange(ex);
    setStep('review');
  }, []);

  const handleCalculate = useCallback(async () => {
    let prices: PriceMap = new Map();

    // Fetch historical prices if enabled
    if (usePrecisePrices) {
      setIsFetchingPrices(true);
      setPriceProgress({ done: 0, total: 0, skippedOld: 0 });
      try {
        prices = await prefetchPrices(transactions, (done, total, skippedOld) => {
          setPriceProgress({ done, total, skippedOld: skippedOld ?? 0 });
        });
        setPriceMap(prices);
      } catch (err) {
        console.warn('Failed to fetch prices, using simplified rates:', err);
      }
      setIsFetchingPrices(false);
    }

    const calculator = new FIFOCalculator();
    const { events } = calculator.calculate(transactions, prices.size > 0 ? prices : undefined);
    setTaxEvents(events);

    const years = [...new Set(events.map((e) => e.date.getFullYear()))].sort((a, b) => b - a);
    if (years.length > 0) {
      setSelectedYear(years[0]);
    }
    setStep('results');
  }, [transactions, usePrecisePrices]);

  const availableYears = useMemo(() => {
    return [...new Set(taxEvents.map((e) => e.date.getFullYear()))].sort((a, b) => b - a);
  }, [taxEvents]);

  const currentSummary: TaxSummary | null = useMemo(() => {
    if (taxEvents.length === 0) return null;
    return generateTaxSummary(taxEvents, selectedYear, taxMode, otherIncome);
  }, [taxEvents, selectedYear, taxMode, otherIncome]);

  const handleTaxModeChange = useCallback((mode: TaxMode, income: number) => {
    setTaxMode(mode);
    setOtherIncome(income);
  }, []);

  const handleEventPriceChange = useCallback((eventId: string, newUnitPrice: number) => {
    setTaxEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        const newProceeds = newUnitPrice * e.amountSold;
        const newNetProceeds = newProceeds - e.feesEUR;
        const newGainLoss = newNetProceeds - e.costBasisEUR;
        return {
          ...e,
          unitPriceEUR: newUnitPrice,
          proceedsEUR: newProceeds,
          netProceedsEUR: newNetProceeds,
          gainLoss: newGainLoss,
          priceSource: 'manual' as const,
        };
      })
    );
  }, []);

  const handleExportPDF = useCallback(() => {
    if (currentSummary) {
      exportTaxReportPDF(currentSummary);
    }
  }, [currentSummary]);


  const goToPage = (p: Page) => {
    setPage(p);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => goToPage('app')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CT</span>
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold text-white leading-tight">CryptoTaxLocal</h1>
              <p className="text-xs text-gray-500">Calculateur fiscal crypto 100% local</p>
            </div>
          </button>

          {/* Stepper - only show on app page */}
          {page === 'app' && (
            <div className="hidden md:flex items-center gap-2">
              {(['import', 'review', 'results'] as AppStep[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  {i > 0 && <div className="w-8 h-px bg-gray-700" />}
                  <div className={`
                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
                    ${step === s ? 'bg-blue-600 text-white' :
                      (['import', 'review', 'results'].indexOf(step) > i) ? 'bg-emerald-600 text-white' :
                      'bg-gray-800 text-gray-500'}
                  `}>
                    {(['import', 'review', 'results'].indexOf(step) > i) ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (i + 1)}
                  </div>
                  <span className={`text-xs ${step === s ? 'text-gray-200' : 'text-gray-500'}`}>
                    {s === 'import' ? 'Import' : s === 'review' ? 'Verification' : 'Resultats'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4">
          <button onClick={() => goToPage('guide')} className="text-sm text-gray-400 hover:text-blue-400 transition-colors hidden md:block">
            Guide fiscal
          </button>
          <button onClick={() => goToPage('comparatif')} className="text-sm text-gray-400 hover:text-blue-400 transition-colors hidden md:block">
            Comparatif
          </button>
          <button onClick={() => goToPage('guide3916bis')} className="text-sm text-gray-400 hover:text-blue-400 transition-colors hidden md:block">
            3916-bis
          </button>
          <button onClick={() => goToPage('simulateur')} className="text-sm text-amber-400 hover:text-amber-300 transition-colors hidden md:block font-medium">
            Simulateur
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex-1">
        {/* Freshness alerts */}
        {page === 'app' && <FreshnessCheck />}
        {/* Content pages */}
        {page === 'guide' && <GuideFiscalCrypto onBack={() => goToPage('app')} onGoToTool={() => goToPage('app')} />}
        {page === 'comparatif' && <ComparatifOutils onBack={() => goToPage('app')} onGoToTool={() => goToPage('app')} />}
        {page === 'guide3916bis' && <Guide3916bis onBack={() => goToPage('app')} onGoToTool={() => goToPage('app')} />}
        {page === 'simulateur' && <Simulateur onBack={() => goToPage('app')} />}
        {page === 'mentions' && <MentionsLegales onBack={() => goToPage('app')} />}
        {page === 'confidentialite' && <PolitiqueConfidentialite onBack={() => goToPage('app')} />}
        {page === 'cgu' && <CGU onBack={() => goToPage('app')} />}

        {/* App pages */}
        {page === 'app' && step === 'import' && (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Calculez vos impots crypto
              </h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Importez votre historique, obtenez votre rapport fiscal.
                Gratuit, sans inscription, 100% dans votre navigateur.
              </p>
            </div>
            <ImportStep onImport={handleImport} onGoToSimulator={() => goToPage('simulateur')} />
          </>
        )}

        {page === 'app' && step === 'review' && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Verifiez vos transactions</h2>
              <p className="text-gray-400">Assurez-vous que tout est correct avant le calcul</p>
            </div>
            <ReviewStep
              transactions={transactions}
              errors={parseErrors}
              exchange={exchange}
              usePrecisePrices={usePrecisePrices}
              onTogglePrecisePrices={setUsePrecisePrices}
              isFetchingPrices={isFetchingPrices}
              priceProgress={priceProgress}
              onCalculate={handleCalculate}
              onBack={() => setStep('import')}
            />
          </>
        )}

        {page === 'app' && step === 'results' && currentSummary && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Votre rapport fiscal</h2>
              <p className="text-gray-400">Estimation basee sur la formule francaise (Art. 150 VH bis) — PFU 31,4% (2026)</p>
            </div>
            <ResultsStep
              summary={currentSummary}
              availableYears={availableYears}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              onTaxModeChange={handleTaxModeChange}
              onEventPriceChange={handleEventPriceChange}
              onExportPDF={handleExportPDF}
              onBack={() => setStep('review')}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          {/* Donation */}
          <div className="flex flex-col items-center gap-3 pb-6 border-b border-gray-800">
            <p className="text-xs text-gray-500">Projet gratuit et open-source — soutenir le developpement</p>
            <DonationAddress />
            <DonationTransparency />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-xs text-gray-600">
                CryptoTaxLocal — Outil open-source de calcul fiscal crypto.
              </p>
              <p className="text-xs text-gray-700 mt-1">
                Aucune donnee n'est envoyee a un serveur. Cet outil ne constitue pas un conseil fiscal.
              </p>
              {/* Commit hash — will work on Cloudflare Pages where define vars are injected at build */}
            </div>
            <div className="flex gap-4 text-xs">
              <button onClick={() => goToPage('mentions')} className="text-gray-500 hover:text-gray-300 transition-colors">
                Mentions legales
              </button>
              <button onClick={() => goToPage('confidentialite')} className="text-gray-500 hover:text-gray-300 transition-colors">
                Confidentialite
              </button>
              <button onClick={() => goToPage('cgu')} className="text-gray-500 hover:text-gray-300 transition-colors">
                CGU
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DonationAddress() {
  const [copied, setCopied] = useState(false);
  const BTC_ZPUB = 'zpub6nX21p4t5H6gxUMqQXC2jRQtejWFWa6dMnZH7aENX8Z1LrzRUpJtpN4fT1AwTxYndj1o9oCtUp6fHcmvA14L4vDNRHkzQxf471e9osTyHGd';

  const handleCopy = () => {
    navigator.clipboard.writeText(BTC_ZPUB).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-700">
        {/* BTC icon */}
        <svg className="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.5 11.5v-2h1.25c.69 0 1.25.56 1.25 1.25S13.44 12 12.75 12H11.5v-.5zm0 1h1.25c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25H11.5v-2.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.75 14.5H11.5V18h-1v-1.5H9v-1h1.5v-7H9v-1h1.5V6h1v1.5h1.25c1.24 0 2.25 1.01 2.25 2.25 0 .78-.4 1.47-1 1.87.84.4 1.5 1.25 1.5 2.13 0 1.24-1.01 2.25-2.25 2.25h-.5V18h-1v-1.5z"/>
        </svg>
        <code className="text-xs text-gray-400 max-w-[200px] md:max-w-[400px] truncate">
          {BTC_ZPUB}
        </code>
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors whitespace-nowrap"
        >
          {copied ? 'Copie !' : 'Copier'}
        </button>
      </div>
    </div>
  );
}

export default App;
