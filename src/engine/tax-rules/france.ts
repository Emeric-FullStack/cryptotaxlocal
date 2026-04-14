/**
 * French Crypto Tax Rules (2025-2026)
 *
 * Article 150 VH bis du Code General des Impots
 * Mis a jour selon la Loi de Finances 2026 et PLFSS 2026
 *
 * Sources :
 * - impots.gouv.fr (consulte le 14 avril 2026)
 * - Loi de Finances 2025, article 54 (transposition DAC8)
 * - PLFSS 2026 (hausse CSG revenus du capital)
 * - Ordonnance 2024-936 du 15 octobre 2024
 *
 * Key rules:
 * 1. Flat tax (PFU) de 31.4% sur les plus-values nettes crypto
 *    - 12.8% impot sur le revenu (IR)
 *    - 18.6% prelevements sociaux (CSG 10.6% + CRDS 0.5% + PS 7.5%)
 *    Note: La CSG sur revenus du capital est passee de 9.2% a 10.6% (PLFSS 2026)
 *
 * 2. Option pour le bareme progressif de l'IR
 *    - Case 3CN de la declaration 2042-C
 *    - Dans ce cas : bareme progressif IR + 18.6% prelevements sociaux
 *    - L'option n'est plus irrevocable (Loi de Finances 2026)
 *
 * 3. Evenements imposables :
 *    - Vente de crypto contre fiat (EUR, USD, etc.)
 *    - Paiement de biens/services en crypto
 *    - Echanges crypto-crypto : NON imposables (maintenu)
 *      ATTENTION: l'ordonnance 2024-936 prevoit la taxation
 *      des echanges crypto-crypto a partir du 1er juillet 2026
 *
 * 4. Non imposable :
 *    - Transferts entre vos propres wallets
 *    - Reception de crypto (don, airdrop) — impose a la revente
 *
 * 5. Formule de calcul (Article 150 VH bis CGI) :
 *    Plus-value = (Prix de cession - Frais) - (Prix total d'acquisition du portefeuille *
 *                 ((Prix de cession - Frais) / Valeur globale du portefeuille))
 *    Ou "Frais" = frais d'exchange + gas fees (BOFIP BOI-RPPM-PVBMC-30-20)
 *
 * 6. Declarations :
 *    - Formulaire 2086 : detail des operations (annexe 2042-C)
 *    - Case 3AN : plus-values nettes
 *    - Case 3BN : moins-values nettes
 *    - Formulaire 3916-bis : comptes crypto a l'etranger
 *      (amende 750 EUR par compte non declare, 1500 EUR si > 50 000 EUR)
 *
 * 7. Seuil d'exoneration :
 *    - 305 EUR de cessions annuelles par foyer fiscal
 *    - En dessous, les gains sont exoneres (mais le formulaire 2086 reste obligatoire)
 *
 * 8. DAC8 (directive europeenne) :
 *    - Effective 1er janvier 2026
 *    - Les prestataires crypto doivent transmettre les donnees aux impots
 *    - Premier reporting : 30 septembre 2027 (transactions 2026)
 */

export type TaxMode = 'flat_tax' | 'progressive';

export const FRANCE_TAX_RULES = {
  // === TAUX PFU (Flat Tax) - Mis a jour 2026 ===
  flatTaxRate: 0.314,          // 31.4% total
  incomeTaxRate: 0.128,        // 12.8% IR
  socialChargesRate: 0.186,    // 18.6% prelevements sociaux (CSG 10.6% + CRDS 0.5% + PS 7.5%)

  // === Bareme progressif IR 2026 (revenus 2025) ===
  // Source: service-public.gouv.fr/particuliers/vosdroits/F1419
  progressiveBrackets: [
    { upTo: 11_600, rate: 0 },
    { upTo: 29_579, rate: 0.11 },
    { upTo: 84_577, rate: 0.30 },
    { upTo: 181_917, rate: 0.41 },
    { upTo: Infinity, rate: 0.45 },
  ],

  // Seuil d'exoneration (305 EUR de cessions annuelles)
  exemptionThreshold: 305,

  // Methode de calcul
  method: 'FIFO' as const,

  // Formulaires
  forms: {
    capitalGains: '2086',        // Plus-values sur actifs numeriques
    complementary: '2042-C',     // Declaration complementaire
    foreignAccounts: '3916-bis', // Declaration des comptes crypto a l'etranger
    caseGain: '3AN',             // Case plus-values
    caseLoss: '3BN',             // Case moins-values
    caseProgressive: '3CN',      // Case option bareme progressif
  },

  // Penalites 3916-bis
  penalties: {
    perUndeclaredAccount: 750,        // EUR
    perUndeclaredAccountOver50k: 1500, // EUR si solde > 50 000 EUR
  },

  // Exchanges qui necessitent 3916-bis
  // Les plateformes enregistrees PSAN en France n'ont PAS besoin d'etre declarees
  requiresForeignAccountDeclaration: (exchange: string): boolean => {
    const frenchPSAN = [
      'paymium', 'coinhouse', 'bitstack', 'meria',
      'binance',  // Binance France SAS est enregistre PSAN
    ];
    return !frenchPSAN.includes(exchange.toLowerCase());
  },
};

/**
 * Calcul de l'impot avec la flat tax (PFU)
 */
export function calculateFlatTax(netGain: number, totalProceeds: number): {
  taxDue: number;
  incomeTax: number;
  socialCharges: number;
  effectiveRate: number;
  isExempt: boolean;
} {
  // Exoneration si total des cessions < 305 EUR
  if (totalProceeds <= FRANCE_TAX_RULES.exemptionThreshold) {
    return { taxDue: 0, incomeTax: 0, socialCharges: 0, effectiveRate: 0, isExempt: true };
  }

  if (netGain <= 0) {
    return { taxDue: 0, incomeTax: 0, socialCharges: 0, effectiveRate: 0, isExempt: false };
  }

  const incomeTax = netGain * FRANCE_TAX_RULES.incomeTaxRate;
  const socialCharges = netGain * FRANCE_TAX_RULES.socialChargesRate;
  const taxDue = incomeTax + socialCharges;

  return {
    taxDue,
    incomeTax,
    socialCharges,
    effectiveRate: taxDue / netGain,
    isExempt: false,
  };
}

/**
 * Calcul de l'impot avec le bareme progressif
 * Note: simplifie — ne prend pas en compte le quotient familial
 */
export function calculateProgressiveTax(netGain: number, totalProceeds: number, otherIncome: number = 0): {
  taxDue: number;
  incomeTax: number;
  socialCharges: number;
  effectiveRate: number;
  isExempt: boolean;
} {
  if (totalProceeds <= FRANCE_TAX_RULES.exemptionThreshold) {
    return { taxDue: 0, incomeTax: 0, socialCharges: 0, effectiveRate: 0, isExempt: true };
  }

  if (netGain <= 0) {
    return { taxDue: 0, incomeTax: 0, socialCharges: 0, effectiveRate: 0, isExempt: false };
  }

  // Calcul IR sur le total des revenus (simplifie, 1 part)
  const totalIncome = otherIncome + netGain;
  const taxWithCrypto = calculateProgressiveIR(totalIncome);
  const taxWithoutCrypto = calculateProgressiveIR(otherIncome);
  const incomeTax = taxWithCrypto - taxWithoutCrypto;

  // Prelevements sociaux toujours a 18.6%
  const socialCharges = netGain * FRANCE_TAX_RULES.socialChargesRate;
  const taxDue = incomeTax + socialCharges;

  return {
    taxDue,
    incomeTax,
    socialCharges,
    effectiveRate: netGain > 0 ? taxDue / netGain : 0,
    isExempt: false,
  };
}

function calculateProgressiveIR(income: number): number {
  let tax = 0;
  let previousLimit = 0;

  for (const bracket of FRANCE_TAX_RULES.progressiveBrackets) {
    const taxableInBracket = Math.min(income, bracket.upTo) - previousLimit;
    if (taxableInBracket <= 0) break;
    tax += taxableInBracket * bracket.rate;
    previousLimit = bracket.upTo;
  }

  return tax;
}

// Re-export pour compatibilite
export function calculateFrenchTax(netGain: number, totalProceeds: number = Infinity): ReturnType<typeof calculateFlatTax> {
  return calculateFlatTax(netGain, totalProceeds);
}

/**
 * Get the list of exchanges that need 3916-bis declaration
 */
export function getExchangesNeedingDeclaration(exchanges: string[]): string[] {
  return exchanges.filter(FRANCE_TAX_RULES.requiresForeignAccountDeclaration);
}

/**
 * Format currency for French locale
 * Compatible avec jsPDF (remplace les espaces insecables par des espaces normaux)
 */
export function formatEUR(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
    // Remplacer les espaces insecables (\u00A0 et \u202F) par des espaces normaux
    // Cela evite le bug d'affichage "/" dans jsPDF
    .replace(/\u00A0/g, ' ')
    .replace(/\u202F/g, ' ');
}
