# Guma Phase 1 — Monorepo

> Auto-generate free websites for local businesses, deliver them via cold email, convert owners to paying subscribers.

---

## Structure

```
apps/
├── crawler/     Node.js — scrapes business listings (YellowPages, Google Places, Apify, Bright Data)
├── generator/   Node.js — generates HTML websites via Claude API + BullMQ
├── outreach/    Node.js — sends personalised cold emails via Resend + BullMQ follow-ups
└── frontend/    Next.js 14 — marketing site, claim flow, dashboard, admin panel
```

---

## How it works

```
Directories (YellowPages, Yelp, …)
        │
        ▼
  apps/crawler          Playwright + BullMQ
  scrape() ──► businesses table (Supabase)
  filter() ──► guma:generate queue
        │
        ▼
  apps/generator        Claude API + BullMQ
  generate() ──► websites table (HTML stored in Supabase)
  publish()  ──► guma:outreach queue
        │
        ▼
  apps/outreach         Resend + BullMQ
  send()     ──► personalised cold email → business owner
  followup() ──► +72h follow-up if opened but not claimed
        │
        ▼
  apps/frontend         Next.js 14 on Vercel
  /                     Marketing
  /claim/[slug]         Preview + verify + claim
  /sites/[slug]         Live generated site (public)
  /dashboard            User overview + site editor
  /admin                Platform metrics (admin only)
```

---

## Local dev

**Prerequisites:** Node 20+, pnpm 9+, Redis, Docker (optional)

```bash
# Install all workspace dependencies
pnpm install

# Run individual services
pnpm dev:crawler
pnpm dev:generator
pnpm dev:outreach

# Run frontend
cd apps/frontend && pnpm dev

# Run everything via Docker
docker-compose up
```

Copy each app's `.env.example` to `.env` and fill in the required values before starting.

---

## Environment variables

Each app has its own `.env.example`. Key shared variables:

| Variable | Used by |
|---|---|
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | crawler, generator, outreach, frontend |
| `ANTHROPIC_API_KEY` | generator |
| `RESEND_API_KEY` | outreach |
| `REDIS_URL` | crawler, generator, outreach |
| `STRIPE_SECRET_KEY` | frontend |
