<div align="right">

**[:gb: English](README.md)** | :fr: Francais

</div>

<div align="center">

<img src="public/favicon.svg" alt="CryptoTaxLocal" width="80" height="80" />

# CryptoTaxLocal

**Calculateur fiscal crypto 100% local, gratuit, sans inscription.**

Vos donnees ne quittent jamais votre navigateur.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Cout serveur](https://img.shields.io/badge/cout_serveur-0_EUR%2Fmois-brightgreen)](#stack-technique)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Essayer en ligne](#) · [Signaler un bug](https://github.com/Emeric-FullStack/cryptotaxlocal/issues) · [Contribuer](CONTRIBUTING.md)

</div>

---

<div align="center">

> **Saison fiscale 2026 en cours** — Taux mis a jour (PFU 31,4%), formulaire 2086, seuil 305 EUR.

</div>

## Pourquoi CryptoTaxLocal ?

Les outils existants vous obligent a **creer un compte**, **uploader vos transactions** sur leurs serveurs, et **payer** pour un rapport fiscal. Pour des donnees financieres sensibles, ca ne devrait pas etre necessaire.

CryptoTaxLocal fait tout ca **dans votre navigateur**. Rien ne sort de votre machine.

<table>
<tr><th></th><th>CryptoTaxLocal</th><th>Koinly</th><th>Waltio</th></tr>
<tr><td><strong>Prix</strong></td><td>Gratuit</td><td>49 - 199 $/an</td><td>39 - 999 EUR/an</td></tr>
<tr><td><strong>Inscription</strong></td><td>Non</td><td>Oui</td><td>Oui</td></tr>
<tr><td><strong>Donnees sur serveur</strong></td><td>Non (100% local)</td><td>Oui (cloud)</td><td>Oui (cloud)</td></tr>
<tr><td><strong>Open source</strong></td><td>Oui (MIT)</td><td>Non</td><td>Non</td></tr>
<tr><td><strong>Export PDF gratuit</strong></td><td>Oui</td><td>Non (payant)</td><td>Non (payant)</td></tr>
<tr><td><strong>Hors-ligne (PWA)</strong></td><td>Oui</td><td>Non</td><td>Non</td></tr>
</table>

## Fonctionnalites

<table>
<tr>
<td width="50%">

**Import & Calcul**
- Import CSV auto-detection (4 formats Binance, Kraken, Coinbase)
- Formule francaise Article 150 VH bis (PA global, pas un simple FIFO)
- Prix historiques via Binance API (illimite) + CoinGecko (fallback)
- Frais deduits du prix de cession (exchange + gas fees)

</td>
<td width="50%">

**Fiscal France 2026**
- PFU 31,4% ou bareme progressif (toggle)
- Seuil d'exoneration 305 EUR
- Export PDF avec frais, cours, sources
- Aide formulaire 2086 (3AN / 3BN / 3CN)

</td>
</tr>
<tr>
<td>

**Confidentialite & Transparence**
- Zero serveur, zero tracking
- Donnees 100% dans le navigateur
- Code open-source auditable
- Hash du commit verifiable dans le footer
- PWA : fonctionne hors-ligne

</td>
<td>

**Contenu & UX**
- Cours editables par transaction
- Tooltips sur chaque calcul
- Alertes de fraicheur (build obsolete, changement reglementaire)
- Dark mode

</td>
</tr>
</table>

## Demarrage rapide

```bash
git clone https://github.com/Emeric-FullStack/cryptotaxlocal.git
cd cryptotaxlocal
npm install
npm run dev
```

Ouvrez `http://localhost:5173`, glissez votre CSV, c'est fait.

> **Pas de CSV ?** Cliquez "Essayer avec des donnees de demonstration" dans l'app.

## Taux fiscaux (avril 2026)

| Composante | Taux | Source |
|:---|:---:|:---|
| Impot sur le revenu (IR) | 12,8% | Art. 200 A CGI |
| CSG | 10,6% | PLFSS 2026 |
| CRDS | 0,5% | |
| Prelevement de solidarite | 7,5% | |
| **Total PFU (Flat Tax)** | **31,4%** | |

<details>
<summary><strong>Details et cas particuliers</strong></summary>

- **Seuil d'exoneration :** Si le total de vos cessions annuelles est inferieur a 305 EUR, les gains sont exoneres.
- **Option bareme progressif :** Vous pouvez opter pour le bareme progressif de l'IR (case 3CN) si c'est plus avantageux.
- **Echanges crypto-crypto :** Non imposables jusqu'au 30 juin 2026. Imposables a partir du 1er juillet 2026 (ordonnance 2024-936).
- **DAC8 :** Depuis le 1er janvier 2026, les plateformes crypto transmettent vos donnees aux autorites fiscales europeennes.

</details>

## Exchanges supportes

| Exchange | Format | Statut |
|:---|:---|:---:|
| Binance | CSV Trade History | :white_check_mark: |
| Kraken | CSV Trades | :white_check_mark: |
| Coinbase | CSV Transaction History | :white_check_mark: |
| KuCoin | — | :construction: Prevu |
| Bybit | — | :construction: Prevu |
| Revolut | — | :construction: Prevu |

> Vous utilisez un exchange non supporte ? [Ouvrez une issue](https://github.com/Emeric-FullStack/cryptotaxlocal/issues) ou [contribuez un parser](CONTRIBUTING.md).

## Stack technique

```
Frontend     React 19 + TypeScript + Vite
Style        Tailwind CSS v4
PDF          jsPDF + jspdf-autotable
Parsing      PapaParse
Prix         Binance public API (principal) + CoinGecko (fallback)
Hebergement  Cloudflare Pages
Backend      Aucun
BDD          Aucune
Cout/mois    0 EUR
```

## Architecture

```
src/
├── components/
│   ├── ImportStep.tsx          # Drag & drop CSV + auto-detection
│   ├── ReviewStep.tsx          # Verification des transactions
│   ├── ResultsStep.tsx         # Resultats + decomposition fiscale
│   ├── legal/                  # Mentions legales, RGPD, CGU
│   └── pages/                  # Guide fiscal, comparatif, 3916-bis
├── engine/
│   ├── parsers/
│   │   ├── binance.ts          # Parser CSV Binance
│   │   ├── kraken.ts           # Parser CSV Kraken
│   │   ├── coinbase.ts         # Parser CSV Coinbase
│   │   └── index.ts            # Auto-detection + dispatch
│   ├── calculator/
│   │   └── fifo.ts             # Formule francaise (Art. 150 VH bis) + resume fiscal
│   ├── prices/
│   │   ├── binance-api.ts      # API publique Binance (sans limite historique)
│   │   ├── coingecko.ts        # CoinGecko fallback (limite 365j)
│   │   └── index.ts            # Service de prix multi-source
│   ├── tax-rules/
│   │   └── france.ts           # Regles FR (taux, seuils, bareme progressif)
│   └── export/
│       └── pdf.ts              # Generation rapport PDF
└── types/
    └── index.ts                # Types TypeScript
```

## Contribuer

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les details.

<details>
<summary><strong>Idees de contributions par difficulte</strong></summary>

**Facile**
- Ajouter le parser d'un nouvel exchange
- Corriger des bugs d'affichage
- Ameliorer les traductions

**Moyen**
- Integrer des taux de change historiques (API CoinGecko)
- Ajouter le support DeFi / staking / NFT
- Interface de saisie manuelle de transactions

**Avance**
- Ajouter d'autres juridictions (Belgique, Suisse, Quebec)
- Import direct via API exchange (read-only)
- Tests automatises

</details>

```bash
npm run dev        # Developpement
npx tsc --noEmit   # Verification des types
npm run build      # Build production
```

## Formulaires fiscaux concernes

| Formulaire | Usage |
|:---|:---|
| **2086** | Detail des operations sur actifs numeriques |
| **2042-C** | Cases 3AN (plus-values) et 3BN (moins-values) |
| **3916-bis** | Declaration des comptes crypto a l'etranger |

> :warning: Tous les exchanges non enregistres PSAN en France doivent etre declares via le formulaire 3916-bis. Amende : 750 EUR par compte non declare (1 500 EUR si solde > 50 000 EUR).

## Financement

CryptoTaxLocal est gratuit et le restera. Le projet est finance par :

- **Liens d'affiliation** — Certains articles du site contiennent des liens vers des plateformes crypto. Ces liens sont toujours clairement identifies. Ils n'influencent ni le fonctionnement de l'outil ni les resultats des calculs.
- **Dons Bitcoin** — Si l'outil vous est utile, vous pouvez soutenir le developpement.

> L'outil lui-meme ne contient aucun lien d'affiliation, aucune publicite, et aucun tracking. Seuls les articles de contenu peuvent contenir des liens sponsorises.

## Securite

Voir [SECURITY.md](SECURITY.md) pour la politique de signalement de vulnerabilites.

## Avertissement

> Cet outil fournit une **estimation indicative** et ne constitue pas un conseil fiscal. Pour une declaration precise, consultez un expert-comptable specialise en cryptomonnaies.

## Licence

[MIT](LICENSE) — Libre d'utilisation, modification et distribution.

---

<div align="center">

**[Essayer CryptoTaxLocal](#)** · Fait avec :keyboard: par [@Emeric-FullStack](https://github.com/Emeric-FullStack)

</div>
