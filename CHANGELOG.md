# Changelog

All notable changes to this project will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-04-15

### Changed
- **BREAKING: Tax calculation now uses the exact French formula (Article 150 VH bis CGI)**
  instead of simple FIFO lot-matching. The PA (prix total d'acquisition) is a global
  running total decremented proportionally at each sale. This matches the legal requirement.
- Historical prices now fetched via Binance public API (no history limit) with CoinGecko as fallback
- Binance CSV parser rewritten to support 4 formats (Trade History 2025-2026, Transaction History, Legacy, Order History)

### Added
- Transaction fees are now deducted from sale proceeds (BOFIP BOI-RPPM-PVBMC-30-20)
- Fee conversion to EUR via Binance API (e.g., BNB fees → EUR at transaction date)
- Flat tax vs progressive tax toggle in results UI
- Editable unit price per transaction (click to adjust)
- Tooltips explaining each column in the results table
- Price source indicator (Binance/CoinGecko, CSV, Manual)
- Freshness check: warns if build is outdated, tax rules year mismatch, or crypto-crypto rule change
- Verifiable commit hash in footer (links to GitHub commit)
- Security headers for Cloudflare Pages (_headers file)
- Binance affiliate link in content pages

### Fixed
- French formula was incorrectly using FIFO lot costs instead of global PA ratio
- Crypto-to-crypto swaps were incorrectly flagged as taxable (they are NOT until 01/07/2026)
- Progressive tax brackets updated to 2026 values (11,600 / 29,579 / 84,577 / 181,917)
- Declaration deadlines corrected (19 mai paper, 21 mai, 28 mai, 4 juin)
- Coinbase parser: fixed double fee deduction (Subtotal vs Total inclusive)
- Price fallback no longer returns raw crypto amounts as EUR (0.5 BTC ≠ 0.5 EUR)
- jsPDF non-breaking space bug (/ instead of space in French numbers)

## [0.1.0] - 2026-04-14

### Added
- CSV import with auto-detection: Binance, Kraken, Coinbase
- French tax rules 2026: flat tax 31.4% (IR 12.8% + PS 18.6%)
- 305 EUR exemption threshold
- PDF tax report export
- Form 2086 helper (boxes 3AN / 3BN)
- Legal pages: mentions legales, RGPD privacy policy, CGU
- SEO guide: French crypto tax declaration 2026
- SEO guide: Form 3916-bis (foreign account declaration)
- SEO page: Tax tool comparison (Koinly vs Waltio vs CryptoTaxLocal)
- PWA support (works offline)
- Dark mode
- Demo data built-in
- Test CSV files for each exchange
- Bilingual README (EN/FR)
- Open-source community files (CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue/PR templates)
