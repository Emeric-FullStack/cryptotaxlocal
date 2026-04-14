# Contributing to CryptoTaxLocal

Thanks for your interest! Here's how to contribute.

## Adding a parser for a new exchange

This is the most useful contribution. Here's how:

1. Create a file in `src/engine/parsers/` (e.g., `kucoin.ts`)
2. Implement a `parseKucoinCSV(csvContent: string): ParseResult` function
3. Add detection in `src/engine/parsers/index.ts`
4. Add a test file in `test-data/`

Use `src/engine/parsers/binance.ts` as a reference.

## Reporting bugs

Open an issue with:
- What you did
- What you expected
- What actually happened
- Your exchange and CSV format (without personal data)

## Pull requests

1. Fork the repo
2. Create a branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push and open a PR

## Code style

- Strict TypeScript
- No `any` unless documented and justified
- Variable names in English, comments in English or French
- Run `npx tsc --noEmit` before submitting
