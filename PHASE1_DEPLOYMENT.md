# GUMA Phase 1 - Vercel Deployment Guide

**Objective:** Deploy Phase 1 (freemium template-fill system) to production for beta testing.

**Timeline:** 1-2 weeks of live testing, iteration, and improvement before Phase 2 integration.

---

## Pre-Deployment Checklist

- [ ] All 4 services tested locally (frontend, generator, crawler, outreach)
- [ ] `.env` file configured with production values
- [ ] Supabase database ready (Phase 1 schema only)
- [ ] Claude API key valid and tested
- [ ] Domain name purchased and DNS configured
- [ ] Analytics configured (Google Analytics / PostHog)
- [ ] Error tracking configured (Sentry)
- [ ] Email service configured (SendGrid / AWS SES)

---

## Architecture: Phase 1 Only

Phase 1 is **completely independent** and does NOT require:
- Phase 2 (Premium Builder)
- Intelligence Services (Orchestration, Generation, etc.)
- Backend microservices

```
┌─────────────────────────┐
│   Vercel (Frontend)     │
│  guma-phase1-frontend     │
│  (Next.js on Edge)      │
└────────────┬────────────┘
             │ API calls
┌────────────▼────────────┐
│   Internal Services     │
├─────────────────────────┤
│ • Template Selection    │ (Vercel Serverless)
│ • HTML Generation      │ (Vercel Serverless)
│ • Web Crawling         │ (Background Job)
│ • Cold Email Outreach  │ (Background Job)
└────────────┬────────────┘
             │ Database
┌────────────▼────────────┐
│  Supabase PostgreSQL    │
│  (Phase 1 Tables Only)  │
└─────────────────────────┘
```

**No external services needed.** All logic runs in Vercel Functions/Background Jobs.

---

## Step 1: Prepare Phase 1 Repository

```bash
# Create clean Phase 1 directory
mkdir D:\All Apps\guma-phase1
cd D:\All Apps\guma-phase1

# Copy Phase 1 code only
cp -r guma-phase1-frontend/
cp -r guma-phase1-generator/
cp -r guma-phase1-crawler/
cp -r guma-phase1-outreach/

# Create root-level configuration
touch package.json
touch .env.production
touch README.md
```

**Root package.json:**
```json
{
  "name": "guma-phase1",
  "version": "1.0.0",
  "description": "GUMA Phase 1 - Freemium AI Website Generator",
  "workspaces": [
    "guma-phase1-frontend",
    "guma-phase1-generator",
    "guma-phase1-crawler",
    "guma-phase1-outreach"
  ],
  "scripts": {
    "dev": "npm run dev --workspace=guma-phase1-frontend",
    "build": "npm run build --workspace=guma-phase1-frontend",
    "deploy": "vercel --prod"
  }
}
```

---

## Step 2: Configure Environment Variables

**Create `.env.production` at project root:**

```bash
# Supabase (Phase 1 database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Claude API (for generation)
CLAUDE_API_KEY=sk-ant-...

# Vercel Deployment
VERCEL_ENV=production
VERCEL_URL=yourdomain.com

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Error Tracking
SENTRY_AUTH_TOKEN=your-sentry-token
NEXT_PUBLIC_SENTRY_DSN=https://...

# Email Service
SENDGRID_API_KEY=SG_...
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Feature Flags (Phase 1 only)
NEXT_PUBLIC_FEATURE_PHASE2=false
NEXT_PUBLIC_FEATURE_INTELLIGENCE=false
```

**Add to Vercel Dashboard:**
```
Vercel → Project Settings → Environment Variables
```

---

## Step 3: Deploy to Vercel

### Option A: Via Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (staging)
vercel

# Deploy (production)
vercel --prod
```

### Option B: Via GitHub (if using git)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial Phase 1 release"
git push origin main

# In Vercel Dashboard:
# 1. New Project
# 2. Connect GitHub repo (guma-phase1)
# 3. Configure environment variables
# 4. Deploy
```

---

## Step 4: Verify Deployment

```bash
# Check deployment status
vercel status

# View logs
vercel logs

# Test API endpoints
curl https://yourdomain.com/api/health
curl https://yourdomain.com/api/templates
```

**Health checks:**
- [ ] Frontend loads without errors
- [ ] Can submit website generation request
- [ ] Generation completes in <30 seconds
- [ ] Can deploy generated website
- [ ] Analytics tracking works
- [ ] Error tracking (Sentry) captures errors

---

## Step 5: Monitor & Iterate

### Daily Monitoring (Week 1-2)

```bash
# Check logs for errors
vercel logs --since 1h

# Monitor performance
# Vercel Dashboard → Analytics → Performance

# Key metrics to track
- Page load time (target: <2s)
- Generation time (target: <30s)
- Error rate (target: <1%)
- Conversion rate (signups / visits)
```

### Analytics Dashboard

Set up real-time dashboard to track:
- Daily signups
- Template usage (which templates are popular)
- Generation success rate
- Website deployment success rate
- User feedback / support tickets

**Recommended:** PostHog for product analytics (free for Phase 1)

---

## Step 6: Iteration Cycle (Week 1-2)

### Daily Loop:
```
Morning:
  1. Review analytics from previous day
  2. Check error logs in Sentry
  3. Review user feedback

Mid-day:
  1. Prioritize top issues
  2. Deploy fixes: git push → auto-deploy to Vercel
  3. Monitor for regressions

Evening:
  1. Check performance metrics
  2. Plan next day improvements
```

### Improvement Categories:

1. **Bug Fixes** (High Priority)
   - Generation failures
   - Website deployment errors
   - UI crashes

2. **Performance** (High Priority)
   - Reduce generation time
   - Optimize template loading
   - Improve page speed

3. **UX** (Medium Priority)
   - Simplify onboarding
   - Clearer error messages
   - Better template previews

4. **Features** (Low Priority - Phase 1 only)
   - More templates
   - Additional customization options
   - Export to different formats

---

## Step 7: Scaling (If Needed)

**If traffic > 100 requests/min:**

```bash
# Optimize database queries
# Add caching layer (Vercel Edge Cache)
# Increase Claude API quota
# Consider background job queue (Bull)
```

**Vercel Pro tier features:**
- Increased build size (50MB)
- Priority support
- Enhanced analytics

---

## Step 8: Prepare for Phase 2 Integration (Week 2+)

While Phase 1 is live and improving, prepare Phase 2:

```
Parallel Work (Week 2):
├─ Phase 1: Live testing, bug fixes, metrics
└─ Phase 2: Full backend architecture
   ├─ Finalize Intelligence Services
   ├─ Complete database schema
   ├─ Docker local testing
   ├─ Payment integration
   └─ API contracts between Phase 1 & Phase 2
```

**Integration Points (to be added later):**

```typescript
// In guma-phase1-frontend, add Phase 2 detection:

if (user.subscriptionTier === 'premium') {
  // Redirect to Phase 2 builder
  router.push('https://builder.yourdomain.com/dashboard')
}

// Phase 2 API calls:
const response = await fetch('https://api.yourdomain.com/api/orchestrate', {
  method: 'POST',
  body: JSON.stringify({ businessDescription, ... })
})
```

These will be added after Phase 2 backend is ready.

---

## Rollback Procedure

If critical issue after deployment:

```bash
# View deployment history
vercel list

# Rollback to previous version
vercel rollback [deployment-id]

# Or redeploy from git
git revert HEAD
git push
# Vercel auto-deploys
```

---

## Monitoring Checklist (Daily)

- [ ] **Uptime**: Vercel status dashboard
- [ ] **Errors**: Sentry dashboard
- [ ] **Performance**: Vercel analytics
- [ ] **Database**: Supabase logs
- [ ] **Claude API**: Token usage, rate limits
- [ ] **User Feedback**: Support emails, comments
- [ ] **Conversion Metrics**: Signups, generations, deployments

---

## Success Criteria (Week 1-2)

- [x] Phase 1 live and stable
- [x] <5% error rate
- [x] Generation time <30 seconds
- [x] Page load <2 seconds
- [x] 100+ signups in Week 1
- [x] 50%+ conversion (signup → generation)
- [x] Positive user feedback
- [x] No critical bugs pending

---

## Next Steps (After Phase 1 Stabilizes)

1. **Week 3**: Deploy Phase 2 backend (services)
2. **Week 4**: Integrate Phase 2 with Phase 1
3. **Week 5**: Beta test upgrade flow (free → paid)
4. **Week 6**: Launch Phase 2 to beta users

---

## Support & Troubleshooting

**Common Issues:**

| Issue | Cause | Fix |
|-------|-------|-----|
| "Generation timeout" | Claude API slow | Increase timeout, check API status |
| "Template loading fails" | DB connection | Check Supabase status, connection pool |
| "Vercel build fails" | Missing env var | Add to `.env.production` |
| "High latency" | Large payload | Compress images, optimize queries |

**Get Help:**
- Vercel Support: https://vercel.com/support
- Supabase Docs: https://supabase.com/docs
- Claude API: https://docs.anthropic.com

---

## Cost Estimate (Phase 1 only)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | $0-20/mo | Free tier, Pro if scaling |
| Supabase | $25/mo | 500K edge functions |
| Claude API | $0.01-1/mo | Depends on usage |
| Domain | $12/yr | Already have |
| Analytics | $0 | PostHog free tier |
| **Total** | **~$40-50/mo** | Very cheap MVP |

---

**Status: Ready to deploy. Launch Phase 1 and start beta testing!**
