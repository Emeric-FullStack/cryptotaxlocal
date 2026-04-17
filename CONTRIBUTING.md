# Contributing to CryptoTaxLocal

Hi, and thanks for considering a contribution. CryptoTaxLocal is a small,
focused project — every PR gets reviewed personally and every reasonable
contribution gets merged. This guide exists to make that as painless as
possible for you.

**Quick links**

- [Quick start](#quick-start-5-minutes)
- [Ways to contribute](#ways-to-contribute)
- [Project structure](#project-structure)
- [Adding an exchange parser](#adding-an-exchange-parser-the-most-wanted-contribution) — the most wanted contribution
- [Adding a new tax jurisdiction](#adding-a-new-tax-jurisdiction)
- [Writing tests](#writing-tests)
- [Coding standards](#coding-standards)
- [Submitting a pull request](#submitting-a-pull-request)

---

## Quick start (5 minutes)

```bash
# 1. Fork and clone
git clone https://github.com/YOUR-USERNAME/cryptotaxlocal.git
cd cryptotaxlocal

# 2. Install (Node 20+ recommended)
npm install

# 3. Start the dev server
npm run dev
# → http://localhost:5173

# 4. Run the quality gate before committing
npx tsc --noEmit   # type check
npm run lint       # eslint
npm run build      # production build smoke test
```

No backend, no database, no API key needed. Everything runs locally in your browser.

---

## Ways to contribute

Ranked by impact (high → low):

| # | Contribution | Why it matters | Difficulty |
|---|---|---|---|
| 1 | **Exchange parser** (Revolut, KuCoin, Bybit, Bitpanda, Crypto.com…) | Users can't import if their exchange isn't supported. This is the main blocker. | Beginner-friendly |
| 2 | **Tax jurisdiction** (Belgium, Switzerland, Portugal, Germany…) | Expands the user base beyond France. | Intermediate |
| 3 | **Bug fix with an anonymized CSV** | Real-world CSV edge cases are the #1 source of bugs. | Beginner-friendly |
| 4 | **DeFi / NFT / staking logic** | Currently marked as "simplified" — full support would help thousands of users. | Advanced |
| 5 | **UI polish** (empty states, error messages, keyboard shortcuts) | Rough edges hurt conversion. | Beginner-friendly |
| 6 | **Documentation** (English translation of guides, updating tax rates) | Reach more users, keep numbers correct. | Beginner-friendly |
| 7 | **Translation** (EN, DE, ES, IT) | Internationalization. | Beginner-friendly |

Browse open issues tagged [`good-first-issue`](https://github.com/Emeric-FullStack/cryptotaxlocal/labels/good%20first%20issue)
for a curated list, or see [`GOOD_FIRST_ISSUES.md`](./GOOD_FIRST_ISSUES.md).

---

## Project structure

```
src/
├── components/         # React components
│   ├── pages/          # Top-level routes (GuideFiscal, Simulateur, etc.)
│   └── *.tsx           # Shared UI
├── engine/             # Core business logic (no React, pure TS)
│   ├── parsers/        # CSV parsers per exchange (binance, kraken, coinbase)
│   ├── tax-rules/      # Tax calculation per jurisdiction (france_150VH_bis)
│   ├── prices/         # Historical price fetchers (binance-api, coingecko)
│   └── portfolio/      # Transaction → lots → taxable events pipeline
├── hooks/              # useDocumentMeta, useStructuredData
├── routes.ts           # Route constants
└── types/index.ts      # Shared TS types
```

**Separation of concerns:** UI is replaceable — the interesting code lives in `src/engine/`. A contributor writing a parser never has to touch React.

---

## Adding an exchange parser (the most wanted contribution)

Every new parser immediately unblocks users of that exchange. Here's the recipe.

### 1. Get a sample CSV

Either from your own account, or ask in an issue for a user to share an
anonymized export. Place it under `test-data/<exchange>/sample.csv` — commit
only anonymized data.

### 2. Create the parser file

Copy `src/engine/parsers/coinbase.ts` as a template — it handles the trickiest
cases (metadata rows, multiple column names, fee splitting). Rename it to
`src/engine/parsers/<exchange>.ts`.

### 3. Implement `parse<Exchange>CSV`

The contract is a single exported function:

```ts
import type { ParseResult, Transaction, ParseError } from '../../types';

export function parseRevolutCSV(csvContent: string): ParseResult {
  const transactions: Transaction[] = [];
  const errors: ParseError[] = [];
  // ... parse rows, push into transactions ...
  return {
    transactions: transactions.sort((a, b) => a.date.getTime() - b.date.getTime()),
    errors,
    exchange: 'revolut',
    rowsParsed: /* ... */,
  };
}
```

Key rules:

- **Return `Transaction[]`** with `type: 'buy' | 'sell' | 'swap' | 'staking_reward' | 'airdrop'`.
- **`receivedAsset` / `receivedAmount`** = what the user got. **`sentAsset` / `sentAmount`** = what they gave. For a `buy` of BTC with EUR: `receivedAsset = 'BTC'`, `sentAsset = 'EUR'`.
- **Fees go in `feeAmount` / `feeAsset`**, not deducted from amounts. The tax engine handles deduction per BOFIP rules.
- **Return `null` from row-level parsers** for non-taxable lines (sends, deposits, internal transfers). Don't throw.
- **Sort by date ascending** before returning — the cost-basis calculator expects it.

### 4. Register in `src/engine/parsers/index.ts`

Add your parser to the re-exports, the `autoParseCSV` switch, and the
`detectExchange` heuristic (look at a header substring unique to your
exchange's CSV).

### 5. Update the `ExchangeName` union

In `src/types/index.ts`, add your exchange to the `ExchangeName` type.

### 6. Add a test

Create `tests/parsers/<exchange>.test.ts` with at least one sample-row test
(see existing files for style). Run `npm test`.

### 7. PR checklist

- [ ] Parser file with JSDoc explaining the columns it expects
- [ ] Anonymized sample CSV in `test-data/`
- [ ] Registered in `parsers/index.ts` (exports + autoParseCSV + detectExchange)
- [ ] Added to `ExchangeName` type
- [ ] At least one test
- [ ] Mentioned in the README (supported exchanges list)

That's it. PRs that follow this template get merged fast.

---

## Adding a new tax jurisdiction

This is more involved but high-impact. Start by opening a discussion issue
to agree on the calculation semantics before coding.

1. Create `src/engine/tax-rules/<country>_<rule>.ts` — pure function
   `(transactions, year, options) => TaxSummary`.
2. Add the rate constants and threshold at the top of the file with a link
   to the official source (tax authority website, law reference).
3. Add a UI toggle or auto-detection (e.g., browser locale hint).
4. Write tests with at least three realistic scenarios (gain, loss, mixed).
5. Document the chosen method in a comment block at the top of the file.

---

## Writing tests

```bash
npm test                # run once
npm test -- --watch     # watch mode
```

Tests live under `tests/` mirroring the `src/` layout. We use Vitest.

Keep tests **deterministic** — no network calls, no `Date.now()` without
mocking. Use fixtures from `test-data/` for parser tests.

---

## Coding standards

- **Strict TypeScript.** No `any` unless documented and justified.
- **No unnecessary dependencies.** The whole build is currently < 1 MB gzipped.
  Adding a 300 KB library for a one-off utility will not get merged.
- **Naming.** Variable and function names in English. Comments may be English
  or French. User-facing strings stay in French for now (I18N is a separate PR).
- **Formatting.** ESLint will tell you what's wrong; no Prettier.
- **Commits.** Conventional style appreciated but not required:
  `feat: add revolut parser`, `fix: handle empty coinbase rows`, `docs: …`.

Before submitting, the quality gate must be green:

```bash
npx tsc --noEmit && npm run lint && npm test && npm run build
```

---

## Submitting a pull request

1. Fork, branch from `main`, make your changes on a topic branch.
2. Keep the PR focused — one parser, or one bug fix, or one jurisdiction.
   Large mixed PRs are hard to review.
3. Fill in the PR template. Check every applicable checkbox.
4. Reference any related issue with `Closes #123`.
5. Ship it. I aim to review within 48h.

If your PR sits without feedback for more than a week, @mention me — it
slipped through the cracks.

---

## Reporting bugs

Open an issue with:
- What you did (step by step)
- What you expected
- What actually happened
- Your exchange and an anonymized CSV sample (without personal data)
- Browser + OS

A good bug report is half the fix. Thank you for taking the time.

---

## Code of conduct

By participating in this project you agree to abide by the
[Code of Conduct](./CODE_OF_CONDUCT.md).

## Security issues

Please do **not** open a public issue for security vulnerabilities. See
[SECURITY.md](./SECURITY.md) for the private disclosure process.

---

**Questions?** Open a
[Discussion](https://github.com/Emeric-FullStack/cryptotaxlocal/discussions)
or ping me in the issue tracker. Happy hacking.
