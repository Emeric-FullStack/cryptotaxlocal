import { useEffect } from 'react';

interface MetaOptions {
  title: string;
  description?: string;
  canonical?: string;
}

const DEFAULT_TITLE = 'CryptoTaxLocal — Calculateur fiscal crypto 100% local';
const DEFAULT_DESCRIPTION =
  'Calculez vos impots crypto gratuitement. 100% dans votre navigateur, sans inscription, sans upload. Flat tax 31,4% (PFU 2026), Art. 150 VH bis, export PDF formulaire 2086. Binance, Kraken, Coinbase.';

function upsertMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function upsertCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Sets document.title, meta description, og/twitter titles and canonical URL.
 *
 * Not a full SSR/SSG solution — but Googlebot executes JS and picks up these
 * values. For true pre-rendered HTML, see docs/SEO.md (future).
 */
export function useDocumentMeta({ title, description, canonical }: MetaOptions) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const desc = description ?? DEFAULT_DESCRIPTION;
    upsertMeta('name', 'description', desc);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', desc);

    if (canonical) {
      upsertCanonical(canonical);
      upsertMeta('property', 'og:url', canonical);
    }

    return () => {
      document.title = prevTitle || DEFAULT_TITLE;
    };
  }, [title, description, canonical]);
}
