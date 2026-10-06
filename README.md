# FreshLock Store

DTC e-commerce site for [FreshLock](https://www.freshlocksealer.com) handheld vacuum sealers and accessories. International market with JP and TH sub-sites.

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (Git integration, auto-deploy on push to `master`)
- **CDN:** Cloudflare
- **Payment:** PayPal Live (USD) — server-side capture flow in `app/api/paypal`
- **Analytics:** GA4 (server-side + client-side funnel)

## Project Structure

```
app/              # Next.js App Router pages and API routes
  api/paypal/     # PayPal order capture + order persistence
  checkout/       # Checkout flow
  shipping/       # Shipping policy page
  returns/        # Returns policy page
  geo/            # GEO-optimized landing pages
components/       # Shared React components
content/posts/    # Markdown blog posts (GEO content)
lib/              # Shared utilities, data, schema
```

## Order Persistence

On successful PayPal capture, order data is pushed to a private GitHub repo (`jasonyuan886/freshlock-orders`) via the GitHub API. Requires `GITHUB_TOKEN` environment variable. Failure is silent (logs a warning, does not block checkout).

## Return Policy

30-day return window from delivery date. Unified across all storefronts.

## Delivery

7–15 days via DHL Express with full tracking. Free shipping on qualifying orders.

## Local Development

```bash
npm install
npm run dev
```

Requires Node.js 18+ and environment variables for PayPal sandbox/live credentials.

## Deployment

- Push to `master` → Vercel auto-builds and deploys to production
- PRs deploy preview URLs via Vercel branch previews
- Cloudflare handles DNS and CDN distribution

## Operations Documentation

- [HANDOVER.md](https://github.com/jasonyuan886/ai-skills/blob/main/HANDOVER.md) — project handover doc
- [dtc-site-operations/SKILL.md](https://github.com/jasonyuan886/ai-skills/tree/main/dtc-site-operations) — DTC site operations playbook

## Testing

**Test infrastructure is pending.** No automated test suite is configured yet.

## License

Private. All rights reserved.
