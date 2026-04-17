import { useState, useCallback } from 'react';
import { autoParseCSV } from '../engine/parsers';
import ManualEntry from './ManualEntry';
import type { Transaction, ParseError, ExchangeName } from '../types';

interface Props {
  onImport: (transactions: Transaction[], errors: ParseError[], exchange: ExchangeName) => void;
  onGoToSimulator?: () => void;
}

export default function ImportStep({ onImport, onGoToSimulator }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'csv' | 'manual'>('csv');
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);

    try {
      const content = await file.text();
      const result = autoParseCSV(content);
      onImport(result.transactions, result.errors, result.detectedExchange);
    } catch {
      onImport([], [{ row: 0, message: 'Impossible de lire le fichier. Verifiez qu\'il s\'agit d\'un fichier CSV valide.' }], 'manual');
    } finally {
      setIsProcessing(false);
    }
  }, [onImport]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDemoData = useCallback(() => {
    const demoCSV = `Time,Base-Asset,Quote-Asset,Type,Price,Quantity,Total,Fee,Fee-Currency,Trade-ID
2024-01-15 10:30:00,BTC,EUR,BUY,38500.00,0.5,19250.00,0.0005,BNB,D001
2024-02-20 14:15:00,ETH,EUR,BUY,2200.00,5.0,11000.00,0.005,BNB,D002
2024-03-10 09:00:00,BTC,EUR,SELL,42000.00,0.2,8400.00,0.0002,BNB,D003
2024-04-05 16:45:00,ETH,EUR,BUY,3100.00,2.0,6200.00,0.002,BNB,D004
2024-06-15 11:20:00,BTC,EUR,SELL,58000.00,0.15,8700.00,0.00015,BNB,D005
2024-08-01 08:30:00,ETH,EUR,SELL,2800.00,3.0,8400.00,0.003,BNB,D006
2024-10-20 13:00:00,BTC,EUR,BUY,62000.00,0.1,6200.00,0.0001,BNB,D007
2024-11-15 10:00:00,BTC,EUR,SELL,90000.00,0.15,13500.00,0.00015,BNB,D008
2025-01-10 09:30:00,ETH,EUR,BUY,3400.00,3.0,10200.00,0.003,BNB,D009
2025-03-01 14:00:00,ETH,EUR,SELL,3800.00,4.0,15200.00,0.004,BNB,D010`;

    const result = autoParseCSV(demoCSV);
    onImport(result.transactions, result.errors, result.detectedExchange);
  }, [onImport]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Privacy banner */}
      <div className="mb-8 p-4 rounded-lg bg-emerald-900/30 border border-emerald-700/50">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-sm text-emerald-300">
            <strong>100% local.</strong> Vos donnees ne quittent jamais votre navigateur. Aucun serveur, aucun compte, aucun tracking.
          </p>
        </div>
      </div>

      {mode === 'manual' ? (
        <>
          <ManualEntry
            existingCount={0}
            onAddTransactions={(txs) => onImport(txs, [], 'manual')}
          />
          <div className="mt-4 text-center">
            <button onClick={() => setMode('csv')} className="text-sm text-gray-500 hover:text-gray-300">
              Retour a l'import CSV
            </button>
          </div>
        </>
      ) : (
      <>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
          ${isDragging
            ? 'border-blue-400 bg-blue-900/20'
            : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
          }
        `}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".csv,.txt"
          onChange={handleFileInput}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-300">Analyse de {fileName}...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <p className="text-lg text-gray-200">Glissez votre fichier CSV ici</p>
              <p className="text-sm text-gray-500 mt-1">ou cliquez pour parcourir</p>
            </div>
            <div className="flex gap-2 mt-2">
              {['Binance', 'Kraken', 'Coinbase', 'Revolut'].map((ex) => (
                <span key={ex} className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-400 border border-gray-700">
                  {ex}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Secondary actions */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={handleDemoData}
          className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2"
        >
          Donnees de demonstration
        </button>
        <span className="text-gray-700">|</span>
        <button
          onClick={() => setMode('manual')}
          className="text-sm text-gray-500 hover:text-gray-300 underline underline-offset-2"
        >
          Saisie manuelle
        </button>
      </div>

      {/* Simulator CTA */}
      {onGoToSimulator && (
        <div className="mt-10">
          <button
            onClick={onGoToSimulator}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-amber-900/30 to-orange-900/20 border border-amber-700/40 hover:border-amber-500/60 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm font-medium text-amber-300 group-hover:text-amber-200">
                  Pas de CSV ? Essayez le simulateur
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Estimez votre impot en 10 secondes — PFU vs bareme progressif — partageable sur les reseaux
                </p>
              </div>
              <svg className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      )}

      {/* How it works */}
      <div className="mt-10 grid grid-cols-3 gap-6">
        {[
          { icon: '1', title: 'Importez', desc: 'CSV ou saisie manuelle' },
          { icon: '2', title: 'Calculez', desc: 'Formule francaise Art. 150 VH bis' },
          { icon: '3', title: 'Exportez', desc: 'Rapport PDF pour votre declaration' },
        ].map((step) => (
          <div key={step.icon} className="text-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mx-auto mb-3">
              {step.icon}
            </div>
            <h3 className="text-sm font-medium text-gray-200">{step.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
          </div>
        ))}
      </div>
      </>
      )}
    </div>
  );
}
