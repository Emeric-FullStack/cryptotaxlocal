/**
 * Configuration des informations légales.
 *
 * Les valeurs sont injectées via des variables d'environnement Vite (VITE_*).
 * En développement : créer un fichier .env à la racine du projet.
 * En production (Cloudflare Pages) : configurer dans Settings > Environment Variables.
 *
 * Voir .env.example pour la liste des variables attendues.
 */

export const legalConfig = {
  /** Nom complet de l'éditeur */
  name: import.meta.env.VITE_LEGAL_NAME || '[NOM PRENOM]',

  /** Nom commercial / raison sociale */
  businessName: import.meta.env.VITE_LEGAL_BUSINESS_NAME || '[NOM COMMERCIAL]',

  /** Numéro SIRET */
  siret: import.meta.env.VITE_LEGAL_SIRET || '[SIRET]',

  /** Adresse postale complète */
  address: import.meta.env.VITE_LEGAL_ADDRESS || '[ADRESSE]',

  /** Email de contact */
  email: import.meta.env.VITE_LEGAL_EMAIL || '[EMAIL]',
} as const;
