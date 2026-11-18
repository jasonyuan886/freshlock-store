# AI-agnostic Site Operations Handover (2026-11-18)

## Scope and ownership
This repository is the FreshLock storefront, not necessarily the separate ZORQIVO site. Confirm domain-to-repository mapping before changing production. Any AI agent with normal GitHub and deployment permissions may maintain this project; no proprietary ChatGPT workflow is required.

## Verified baseline
- Repository: jasonyuan886/freshlock-store, default branch master.
- README states Next.js 14 App Router, TypeScript, Tailwind, Vercel, Cloudflare, PayPal Live, GA4.
- Order persistence uses private jasonyuan886/freshlock-orders through server-side GITHUB_TOKEN.
- README says production auto-deploys on master; treat this as documentation until Vercel settings are independently checked.
- Automated tests are not yet configured according to README.

## Safe takeover procedure
1. Clone repository and inspect package.json, app/, components/, lib/, content/posts/, configuration and git history.
2. Identify the production deployment and verify current domain, branch, DNS, environment variable names (never values), and provider permissions.
3. Run npm install, npm run build and available lint/typecheck scripts locally. Record results.
4. Make changes on a feature branch and open a PR with screenshots, risks, test results, and rollback plan. Do not push unverified changes directly to master.
5. Use preview deployments for visual checks including mobile layout, product gallery images, checkout and shipping/returns.
6. For PayPal, validate sandbox flows; do not execute live purchases without approval. Do not expose credentials, customer data, or private order repositories.
7. Merge only after review and verification. Confirm production URL and monitor errors; rollback via known-good deployment if necessary.

## Operational priorities
- Confirm distorted product images and mobile layouts.
- Check SEO/GEO metadata, structured data, GSC/GA4 instrumentation, canonical URLs and indexing.
- Verify PayPal order capture, order persistence, emails, policy pages, shipping rates and product pricing against approved business settings.
- Maintain English-language customer-facing copy and localization for international sites.
- Document each change in a PR so a different AI can continue without conversation history.

## External integrations and boundaries
- GitHub is the source of truth for versioned code; hosting secrets remain in deployment provider.
- Vercel and Cloudflare access must be verified separately.
- Social publishing is separate: Metricool and platform accounts require their own access and asset library.
- Existing docs: README.md and ai-skills/HANDOVER.md (verify accessibility).
- No credentials, personal data, or production tokens should be committed.

## Handoff acceptance checklist
- [ ] Production domain mapped to repository and deployment
- [ ] Build and lint verified
- [ ] Environment variable *names* documented
- [ ] Preview deployment verified
- [ ] Checkout sandbox tested
- [ ] Rollback process tested
- [ ] Known bugs and open tasks logged as issues
- [ ] Incoming AI can make and verify a PR independently

## Current limitations
This document is an operational starting point, not proof that the production site or ZORQIVO domain has been migrated or that all integrations have been verified.
