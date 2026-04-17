/**
 * Central route paths for the app.
 *
 * URLs are SEO-optimised (French keywords) and listed in public/sitemap.xml.
 * When adding a new route, remember to update the sitemap too.
 */
export const ROUTES = {
  home: '/',
  guideFiscal: '/guide-fiscal-crypto',
  comparatif: '/comparatif-outils-fiscaux-crypto',
  guide3916bis: '/declaration-3916-bis',
  simulateur: '/simulateur-plus-value-crypto',
  mentions: '/mentions-legales',
  confidentialite: '/confidentialite',
  cgu: '/cgu',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
