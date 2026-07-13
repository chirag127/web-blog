# Security Policy

## Supported versions

Only the latest production deployment at https://blog.oriz.in is supported.

## Scope

This is a static Astro blog with a Cloudflare Pages deployment.
- Firebase (Firestore) is used for bookmarks — client-side only, public read.
- No server-side auth, no card-on-file, no user passwords stored.
- Algolia search keys are public (search-only scoped).
- Giscus comments are handled by GitHub Discussions — report those upstream.

## Reporting a vulnerability

Use GitHub's private security advisory:
https://github.com/chirag127/blog/security/advisories/new

Or email chirag127 via the contact on https://chirag127.github.io.

Include: description, reproduction steps, potential impact.
Response target: 72 hours for acknowledgement, patch within 14 days for confirmed issues.

Do NOT open a public GitHub issue for security vulnerabilities.
