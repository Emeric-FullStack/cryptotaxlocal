/**
 * DonationTransparency — Affiche le solde total des dons BTC
 *
 * Derive les premieres adresses de reception depuis la zpub,
 * interroge mempool.space pour les soldes, et affiche le total en BTC + EUR.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { deriveAddressesFromZpub } from '../engine/bitcoin/derive-addresses';
import {
  fetchDonationSummary,
  type DonationSummary,
} from '../engine/bitcoin/balance-fetcher';

const BTC_ZPUB =
  'zpub6nX21p4t5H6gxUMqQXC2jRQtejWFWa6dMnZH7aENX8Z1LrzRUpJtpN4fT1AwTxYndj1o9oCtUp6fHcmvA14L4vDNRHkzQxf471e9osTyHGd';

const ADDRESS_COUNT = 5;

/** Cache duration: 5 minutes */
const CACHE_TTL_MS = 5 * 60 * 1000;

type FetchState = 'idle' | 'loading' | 'done' | 'error';

export default function DonationTransparency() {
  const [state, setState] = useState<FetchState>('idle');
  const [summary, setSummary] = useState<DonationSummary | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: ADDRESS_COUNT });
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState('loading');
    setError(null);
    setProgress({ done: 0, total: ADDRESS_COUNT });

    try {
      // Step 1: derive addresses (synchronous, fast)
      const derived = deriveAddressesFromZpub(BTC_ZPUB, ADDRESS_COUNT);
      const addresses = derived.map((d) => d.address);

      // Step 2: fetch balances from mempool.space
      const result = await fetchDonationSummary(
        addresses,
        (completed, total) => setProgress({ done: completed, total }),
        controller.signal
      );

      setSummary(result);
      setState('done');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setState('error');
    }
  }, []);

  // Auto-fetch on mount, with cache check.
  // Deferred to avoid synchronous setState within the effect body (React 19 lint).
  useEffect(() => {
    if (summary && Date.now() - summary.fetchedAt < CACHE_TTL_MS) return;
    const timer = setTimeout(fetchData, 0);
    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatBtc = (btc: number) =>
    btc.toLocaleString('fr-FR', {
      minimumFractionDigits: 8,
      maximumFractionDigits: 8,
    });

  const formatEur = (eur: number) =>
    eur.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    });

  const formatSats = (sats: number) => sats.toLocaleString('fr-FR');

  // Addresses with non-zero balance
  const activeAddresses =
    summary?.addresses.filter((a) => a.total > 0) ?? [];

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Toggle button */}
      <button
        onClick={() => {
          setExpanded((prev) => !prev);
          // Refresh if stale
          if (
            !expanded &&
            summary &&
            Date.now() - summary.fetchedAt > CACHE_TTL_MS
          ) {
            fetchData();
          }
        }}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors mx-auto"
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Transparence des dons
        <svg
          className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="mt-3 p-4 rounded-lg bg-gray-800/60 border border-gray-700 space-y-3">
          {/* Loading state */}
          {state === 'loading' && (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <svg
                  className="w-3.5 h-3.5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="31.4"
                    strokeLinecap="round"
                  />
                </svg>
                Interrogation mempool.space ({progress.done}/{progress.total})
              </div>
              <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500/70 rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress.done / progress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Error state */}
          {state === 'error' && (
            <div className="text-center space-y-2">
              <p className="text-xs text-red-400">
                Erreur : {error}
              </p>
              <button
                onClick={fetchData}
                className="text-xs px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
              >
                Reessayer
              </button>
            </div>
          )}

          {/* Results */}
          {state === 'done' && summary && (
            <>
              {/* Total */}
              <div className="text-center space-y-1">
                <p className="text-lg font-mono text-amber-400 font-semibold">
                  {formatBtc(summary.totalBtc)} BTC
                </p>
                {summary.totalEur !== null && (
                  <p className="text-sm text-gray-400">
                    ≈ {formatEur(summary.totalEur)}
                  </p>
                )}
                <p className="text-xs text-gray-600">
                  {formatSats(summary.totalSats)} sats sur{' '}
                  {activeAddresses.length} adresse
                  {activeAddresses.length !== 1 ? 's' : ''} active
                  {activeAddresses.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Price info */}
              {summary.btcEurPrice !== null && (
                <p className="text-center text-xs text-gray-600">
                  1 BTC = {formatEur(summary.btcEurPrice)} (mempool.space)
                </p>
              )}

              {/* Address list (if any have balance) */}
              {activeAddresses.length > 0 && (
                <details className="text-xs">
                  <summary className="text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">
                    Detail par adresse ({activeAddresses.length})
                  </summary>
                  <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
                    {activeAddresses.map((a) => (
                      <div
                        key={a.address}
                        className="flex items-center justify-between gap-2 px-2 py-1.5 rounded bg-gray-900/50"
                      >
                        <a
                          href={`https://mempool.space/address/${a.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-gray-400 hover:text-amber-400 truncate max-w-[200px] md:max-w-[300px] transition-colors"
                          title={a.address}
                        >
                          {a.address}
                        </a>
                        <span className="font-mono text-gray-300 whitespace-nowrap">
                          {formatSats(a.total)} sats
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Verification notice */}
              <p className="text-center text-xs text-gray-600 pt-1 border-t border-gray-700/50">
                Donnees en temps reel via{' '}
                <a
                  href="https://mempool.space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-300 underline transition-colors"
                >
                  mempool.space
                </a>
                {' — '}
                {ADDRESS_COUNT} adresses derivees de la zpub (BIP84)
              </p>

              {/* Refresh button */}
              <div className="text-center">
                <button
                  onClick={fetchData}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  Actualiser
                </button>
              </div>
            </>
          )}

          {/* Idle (shouldn't really show but just in case) */}
          {state === 'idle' && (
            <button
              onClick={fetchData}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors mx-auto block"
            >
              Charger les donnees
            </button>
          )}
        </div>
      )}
    </div>
  );
}
