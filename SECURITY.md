# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in CryptoTaxLocal,
**do not open a public issue**. Contact us directly by email:

**contact [at] cryptotaxlocal [dot] com** (or see the email on the live site's legal page)

We commit to:
- Acknowledging receipt within 48 hours
- Providing a fix timeline
- Crediting you in the fix (if you wish)

## Scope

CryptoTaxLocal is a 100% client-side application. Potential security risks include:

- **XSS via CSV files**: code injection through imported CSV content
- **Vulnerable dependencies**: flaws in npm packages
- **Service Worker**: cache poisoning or data interception

## What is NOT a vulnerability

- User CSV files staying local — that's by design
- Incorrect tax calculations — that's a functional bug, not a security issue
- No encryption of local data — the browser handles this

## Best practices

- We regularly update dependencies
- The code is auditable (open source)
- No user data ever transits through a server
