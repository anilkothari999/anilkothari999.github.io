# Forever Funds (Next.js)

Modern [Next.js](https://nextjs.org) site migrated from the single-file GitHub Pages build at [anilkothari999.github.io](https://github.com/anilkothari999/anilkothari999.github.io).

## What changed

- Hash-only URLs (`#mutual-funds`) are real routes (`/mutual-funds`) for SEO and sharing.
- Global styles, header, footer, and page content are split under `lib/forever-funds/`.
- Form handling and calculators keep the same behaviour; config moves to environment variables.

## Setup

```bash
cd forever-funds
npm install
cp .env.example .env.local
# Add your Google Sheets web app URL (lead form) and optional Supabase keys.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Re-sync from upstream HTML

If the legacy `index.html` changes on GitHub:

```bash
curl -sL https://raw.githubusercontent.com/anilkothari999/anilkothari999.github.io/main/index.html -o /tmp/forever-funds-index.html
node scripts/extract-from-legacy-html.mjs /tmp/forever-funds-index.html
```

## Deploy

Deploy to [Vercel](https://vercel.com) or any Node host (`npm run build` && `npm run start`). Set the same `NEXT_PUBLIC_*` variables in production.

## Git (personal account)

This project is its own git repo. Push to your personal GitHub (e.g. `atuljain2995/forever-funds`) — not a work org remote.