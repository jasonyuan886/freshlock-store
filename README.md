# FreshLock Store

🌐 **Live Site:** [https://www.freshlocksealer.com](https://www.freshlocksealer.com)

E-commerce site for handheld vacuum sealers and vacuum bags.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **State:** React Context (cart)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

- `/` — Homepage with hero, features, products, reviews, FAQ preview
- `/products` — Product listing with category filters and sorting
- `/products/[slug]` — Product detail with images, specs, add to cart
- `/cart` — Shopping cart with quantity controls
- `/checkout` — Checkout form (Stripe/PayPal placeholders)
- `/about` — Brand story
- `/contact` — Contact form
- `/faq` — FAQ accordion
- `/privacy` — Privacy policy (GDPR/Australian compliance)
- `/returns` — 30-day returns policy
- `/terms` — Terms of service

## Products (Mock Data)

1. **FreshLock Pro** — $89.99 AUD (handheld sealer)
2. **FreshLock Starter Kit** — $109.99 AUD (sealer + 20 bags)
3. **Vacuum Seal Bags 30-Pack** — $29.99 AUD (medium)
4. **Vacuum Seal Bags 50-Pack** — $39.99 AUD (large)
5. **FreshLock Travel Kit** — $69.99 AUD (compact + case)

## Design

- **Primary:** Deep blue `#1B365D`
- **Accent:** Green `#2ECC71` (CTA buttons)
- **Background:** Light gray `#F9FAFB`
- Responsive, mobile-first design

## Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Shopping cart with localStorage persistence
- ✅ Product filtering and sorting
- ✅ Image gallery on product pages
- ✅ Quantity controls
- ✅ Free shipping threshold ($79+)
- ✅ Australian-specific (AUD, states, ABN)
- ✅ SEO metadata
- ✅ Accessible (semantic HTML, ARIA)

## Next Steps

- Integrate Stripe/PayPal for payments
- Add product images (replace placeholders)
- Connect to backend/CMS for product management
- Add order confirmation emails
- Implement search functionality
- Add product reviews system
- Set up analytics

## Build

```bash
npm run build
npm start
```

## Project Structure

```
freshlock-store/
├── app/
│   ├── layout.tsx          # Root layout with Header/Footer
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Tailwind + custom styles
│   ├── products/
│   │   ├── page.tsx        # Product listing
│   │   └── [slug]/page.tsx # Product detail
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── faq/page.tsx
│   ├── privacy/page.tsx
│   ├── returns/page.tsx
│   └── terms/page.tsx
├── components/
│   ├── Header.tsx          # Navigation + cart badge
│   └── Footer.tsx          # Footer with links
├── lib/
│   ├── types.ts            # TypeScript types
│   ├── data.ts             # Mock products, reviews, FAQs
│   └── cart-context.tsx    # Cart state management
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```
