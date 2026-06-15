# Guma AI — Monorepo

> Auto-generate free websites for local businesses, deliver them via cold email,
> convert owners to paying subscribers.

---

## Project structure

```
guma/
├── guma-phase1-crawler/      Node.js — Playwright scraper (YellowPages + more)
├── guma-phase1-generator/    Node.js — Claude API HTML generator
├── guma-phase1-outreach/     Node.js — Resend email automation
├── guma-phase1-frontend/     Next.js 14 — marketing site, claim flow, dashboard, admin
├── docker-compose.yml      Local dev: all workers + Redis
└── README.md               ← you are here
```

---

## Architecture

```
Directories (YellowPages, Yelp, …)
        │
        ▼
  guma-crawler          Playwright + BullMQ
  ┌─────────────┐
  │  scrape()   │──► businesses table (Supabase)
  │  filter()   │──► guma:generate queue
  └─────────────┘
        │
        ▼
  guma-generator        Claude claude-sonnet-4-6 API + BullMQ
  ┌─────────────┐
  │  generate() │──► Supabase Storage (HTML) + websites table (meta)
  │  publish()  │──► guma:outreach queue
  └─────────────┘
        │
        ▼
  guma-outreach         Resend + BullMQ
  ┌─────────────┐
  │  send()     │──► personalised cold email → business owner
  │  followup() │──► +72h follow-up if opened but not claimed
  └─────────────┘
        │
        ▼
  guma-frontend         Next.js 14 on Vercel
  ┌──────────────────────────────┐
  │ /                Marketing   │
  │ /auth/signup   Business search + claim entry
  │ /claim/[slug]  Preview + verify + claim
  │ /sites/[slug]  Live generated site (public)
  │ /dashboard     User overview
  │ /dashboard/sites/[slug]/edit  Pro editor
  │ /dashboard/upgrade  Stripe checkout
  │ /admin         Platform metrics (admin only)
  └──────────────────────────────┘
```

---

## Quick start

### 1. Prerequisites

- Node.js 20+
- Docker + Docker Compose (for local workers)
- [Supabase](https://supabase.com) project (free tier OK)
- [Anthropic API key](https://console.anthropic.com)
- [Resend](https://resend.com) account (free tier: 3k emails/mo)
- [Stripe](https://stripe.com) account

### 2. Database

```bash
# In Supabase Dashboard → SQL Editor, run:
cat guma-frontend/supabase-migration.sql
```

### 3. Environment files

```bash
cp guma-crawler/.env.example    guma-crawler/.env
cp guma-generator/.env.example  guma-generator/.env
cp guma-outreach/.env.example   guma-outreach/.env
cp guma-frontend/.env.example   guma-frontend/.env.local
# Fill in all values
```

### 4. Start workers (Docker)

```bash
docker-compose up -d
# Monitor: http://localhost:3001 (BullMQ dashboard)
```

### 5. Start frontend

```bash
cd guma-frontend
npm install
npm run dev
# → http://localhost:3000
```

### 6. Trigger first crawl

```bash
cd guma-crawler
npm install
node src/index.js          # dry run — see what would be crawled
node src/index.js --run    # enqueue jobs
```

### 7. Test site generation

```bash
cd guma-generator
npm install
node src/generate-single.js --demo   # generates Bella's Pizza, no DB needed
open output/bellas-pizza-new-york-ny.html
```

### 8. Test outreach

```bash
cd guma-outreach
npm install
node src/send-batch.js --dry-run     # preview queue
node src/send-batch.js --limit 5     # send 5 test emails
```

---

## Deploy to production

### Frontend → Vercel

```bash
cd guma-frontend
vercel

# Required env vars in Vercel dashboard:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_KEY
# STRIPE_SECRET_KEY
# STRIPE_WEBHOOK_SECRET
# NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
# NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID
# ADMIN_EMAILS=you@yourdomain.com
```

**Stripe webhook** — add in Stripe Dashboard:

- URL: `https://yourdomain.vercel.app/api/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.deleted`

### Workers → Railway

```bash
# One service per worker. In Railway:
# 1. New project → Deploy from GitHub
# 2. Root directory: guma-crawler (or generator/outreach)
# 3. Start command: node src/queue/worker.js
# 4. Add Redis service → copy REDIS_URL to each worker
# 5. Add all env vars
```

---

## Cost at scale

| Service            | At launch | 10k sites/mo |
| ------------------ | --------- | ------------ |
| Vercel (frontend)  | $0        | $20          |
| Supabase           | $0        | $25          |
| Claude API         | ~$10      | ~$100        |
| Railway (workers)  | $5        | $20          |
| Resend (email)     | $0        | $20          |
| Proxies (Webshare) | $10       | $30          |
| **Total**          | **~$25**  | **~$215**    |

At 10k sites with 1% Pro conversion = 100 × $29 = **$2,900 MRR** vs $215 costs.

---

## Email warm-up schedule

Never blast cold email from a fresh domain. Follow this ramp-up:

| Week | Daily sends |
| ---- | ----------- |
| 1    | 20          |
| 2    | 50          |
| 3    | 100         |
| 4+   | 200         |

Set `DAILY_SEND_LIMIT` in `.env` accordingly.

---

## Key files reference

| File                                                     | Purpose                      |
| -------------------------------------------------------- | ---------------------------- |
| `guma-crawler/src/crawler/yellowpages.js`                | Playwright scraper           |
| `guma-crawler/src/utils/proxy.js`                        | Proxy rotation               |
| `guma-generator/src/generator/prompts.js`                | Claude system + user prompts |
| `guma-generator/src/templates/categories.js`             | 6 category configs           |
| `guma-outreach/src/email/templates.js`                   | Personalised email HTML      |
| `guma-frontend/app/claim/[slug]/page.tsx`                | Claim flow                   |
| `guma-frontend/app/dashboard/sites/[slug]/edit/page.tsx` | Pro editor                   |
| `guma-frontend/app/admin/page.tsx`                       | Admin metrics                |
| `guma-frontend/supabase-migration.sql`                   | Full DB schema               |
| `docker-compose.yml`                                     | Local dev stack              |
