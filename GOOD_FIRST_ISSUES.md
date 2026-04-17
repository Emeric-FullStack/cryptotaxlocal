# Good first issues

A curated list of contributions suitable for a first PR. Each entry says:
- **what** to do
- **where** to look in the code
- **what "done" looks like**

Claim one by commenting on the matching GitHub issue (or opening it if it
doesn't exist yet). I'll label it with your handle so nobody duplicates work.

Difficulty legend:
- `easy` — ~30 minutes, no prior knowledge of the codebase needed
- `medium` — ~2h, requires reading one or two modules
- `hard` — half a day+, touches the tax engine or portfolio calculator

---

## Parsers (easy–medium)

These are the highest-impact contributions. See
[CONTRIBUTING.md § Adding an exchange parser](./CONTRIBUTING.md#adding-an-exchange-parser-the-most-wanted-contribution)
for the recipe.

- [ ] **Revolut CSV parser** — `easy` — Revolut is huge in France and users keep asking. A scaffold exists in `src/engine/parsers/revolut.ts` (stub — not yet registered). Flesh out the row mapping, add detection in `parsers/index.ts`, ship a test fixture in `test-data/revolut/`.
- [ ] **Bitpanda CSV parser** — `easy` — Popular EU exchange. Copy `coinbase.ts` as a template.
- [ ] **KuCoin CSV parser** — `easy` — Already in the `ExchangeName` type, just not implemented.
- [ ] **Bybit CSV parser** — `easy` — Similar pattern.
- [ ] **Crypto.com App export parser** — `medium` — The export format has some quirks with staking rewards.
- [ ] **Ledger Live export parser** — `medium` — Different format (on-chain txs, not exchange trades), but very useful for self-custody users.

## UI / UX polish (easy)

- [ ] **Empty-state illustrations** — `src/components/FileDropZone.tsx` and `src/components/ManualEntry.tsx` both have plain text empty states. Add a subtle illustration or icon to make them more inviting.
- [ ] **Keyboard shortcut: Cmd/Ctrl+K to jump to import** — Add a global keydown listener in `src/App.tsx` that resets to step `'import'`.
- [ ] **Copy-to-clipboard button on each tax-box value** — On the results page, the user has to manually select + copy the values for boxes 3AN/3BN/3CN. Add a 📋 button next to each.
- [ ] **Dark/light theme toggle** — Currently dark-only. Tailwind v4 supports `dark:` variants, so it's mostly a CSS refactor.
- [ ] **Better error message when CSV is not recognized** — Currently a generic "aucune transaction". Propose the top 3 most likely exchanges and a link to the parser-request template.

## Docs & translations (easy)

- [ ] **English translation of `/guide-fiscal-crypto`** — The guide is French-only. Translate to EN and add a `/en/tax-guide-france` route (useful for foreign residents in France).
- [ ] **Screenshots** — Real screenshots of the 3 steps (import / review / results) to replace the placeholders in `docs/screenshots/`.
- [ ] **Update `CHANGELOG.md`** on each release — semi-automated, but a well-curated manual entry is always clearer than git log.

## Tests (easy)

- [ ] **More parser test fixtures** — Each existing parser has < 3 test cases. Donate anonymized CSVs covering edge cases (dust amounts, airdrops, forks, staking rewards, wrapped tokens).
- [ ] **End-to-end test with Playwright** — A single smoke test: load the home, drop a sample CSV, assert the results page shows a non-zero tax line.

## Content (medium)

- [ ] **New SEO article: DeFi et fiscalite francaise** — There's nothing good on French DeFi tax treatment online. A 1500-word article in the style of `GuideFiscalCrypto.tsx` would rank fast. Topics: LP pools, yield farming, lending, staking liquide.
- [ ] **New SEO article: Comparatif Koinly vs Waltio vs CryptoTaxLocal** — Already exists but can be expanded with a feature matrix.

## Tax engine (medium–hard)

- [ ] **Belgian tax rules (`src/engine/tax-rules/belgium.ts`)** — Belgium has three regimes (private, speculative, professional) — expose a toggle.
- [ ] **Swiss tax rules** — Wealth tax on December 31 holdings + cantonal variations.
- [ ] **German FIFO per-wallet** — Tricky because Germany uses FIFO per-wallet (not pooled), which is fundamentally different from the French global cost basis.
- [ ] **Wash sale detection & warning** — Flag sells where the user rebought the same asset within 30 days. Not a French rule, but a useful warning for US users later.

## Advanced (hard)

- [ ] **On-chain address import** — User pastes an ETH/BTC address, we fetch transactions via a public RPC (no API key). Massive UX win but careful about rate limits.
- [ ] **DeFi protocol awareness** — Detect Uniswap/Aave/Compound interactions from Ethereum CSV exports and categorize them correctly (LP vs swap vs loan).
- [ ] **NFT cost-basis tracking** — NFTs are per-unit unique, so they don't fit the pooled cost basis model. Needs a separate code path.

---

## Not a contribution but still useful

- Leave a **GitHub star** ⭐ — helps discoverability.
- Share the tool on social media, tax forums, or with a friend doing their crypto declaration.
- Post a Discussions thread with a use case we haven't thought of.

Every contribution matters. Thank you.
