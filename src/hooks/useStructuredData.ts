import { useEffect } from 'react';

/**
 * Injects a JSON-LD <script> into the document head for the lifetime of the
 * calling component. Cleaned up on unmount, so switching routes never leaves
 * stale schema markup behind.
 *
 * Usage:
 *   useStructuredData('faq-guide-fiscal', {
 *     '@context': 'https://schema.org',
 *     '@type': 'FAQPage',
 *     mainEntity: [...]
 *   });
 *
 * The `id` must be unique per page so React's StrictMode double-invocation
 * doesn't duplicate the tag.
 */
export function useStructuredData(id: string, data: object) {
  useEffect(() => {
    const scriptId = `ld-${id}`;
    let el = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement('script');
      el.id = scriptId;
      el.type = 'application/ld+json';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);

    return () => {
      el?.remove();
    };
  }, [id, data]);
}
