# HireMatch AI

AI-powered recruitment platform that matches top talent with the right roles faster. Built with **Next.js 15**, **React 19**, **Supabase**, **Prisma**, **OpenAI**, and **Resend**.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started (Local)](#getting-started-local)
- [Environment Variables](#environment-variables)
- [Supabase Setup](#supabase-setup)
- [OpenAI Setup](#openai-setup)
- [Resend Setup](#resend-setup)
- [Prisma Commands](#prisma-commands)
- [Build Commands](#build-commands)
- [Deploy to Vercel](#deploy-to-vercel)
- [Optimize Performance](#optimize-performance)
- [SEO](#seo)
- [Security](#security)
- [Testing Checklist](#testing-checklist)
- [Project Structure](#project-structure)
- [Authentication & Roles](#authentication--roles)

---

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | Next.js 15 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, Shadcn UI |
| Database | PostgreSQL (Supabase) + Prisma ORM |
| Auth | Supabase Authentication |
| Storage | Supabase Storage (private `resumes` bucket) |
| AI | OpenAI (`gpt-4o-mini`, `text-embedding-3-small`) |
| Email | Resend |
| Deployment | Vercel (recommended) |

See [`prisma/SCHEMA.md`](prisma/SCHEMA.md) for the full database schema.

### HR process automation (Python + n8n)

For workflow automation (resume screening, interview scheduling, employee onboarding), see [`hr-automation/README.md`](hr-automation/README.md). It includes a **FastAPI** service and importable **n8n** workflows.

---

## Getting Started (Local)

### Prerequisites

- **Node.js 20+**
- **npm 10+**
- Supabase project (PostgreSQL + Auth + Storage)
- OpenAI API key (resume parsing, matching, embeddings, search)
- Resend API key (transactional email)

### Installation

```bash
# Clone the repository
git clone https://github.com/pavanvamsi-chimmiri/HireMatch.git
cd HireMatch

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma client
npm run db:generate

# Apply migrations
npm run db:migrate

# Seed sample data (optional, dev only)
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy `.env.example` to `.env` for local development. In production (Vercel), set these in **Project Settings → Environment Variables**.

### App

| Variable | Required | Scope | Description |
| -------- | -------- | ----- | ----------- |
| `NEXT_PUBLIC_APP_URL` | Yes | Client | Public app URL. Local: `http://localhost:3000`. Production: `https://your-domain.com` |
| `NEXT_PUBLIC_APP_NAME` | No | Client | Display name. Default: `HireMatch AI` |

### Database (Prisma)

| Variable | Required | Scope | Description |
| -------- | -------- | ----- | ----------- |
| `DATABASE_URL` | Yes | Server | PostgreSQL connection string. Use **Supabase connection pooler** (port `6543`, `?pgbouncer=true`) in production/serverless |
| `DIRECT_URL` | Prod recommended | Server | Direct PostgreSQL connection (port `5432`) used when running migrations against Supabase pooler. Pass at deploy time: `DATABASE_URL=$DIRECT_URL npx prisma migrate deploy` |

**Local example:**

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/hirematch?schema=public"
```

**Supabase production example:**

```env
# Pooled — used by the app at runtime (Transaction mode)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct — used only for migrations
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

### Supabase

| Variable | Required | Scope | Description |
| -------- | -------- | ----- | ----------- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Client | Supabase project URL (`https://xxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client | Supabase anonymous (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server | Service role key for resume storage upload/download. **Never expose to the client** |

### OpenAI

| Variable | Required | Scope | Description |
| -------- | -------- | ----- | ----------- |
| `OPENAI_API_KEY` | Yes | Server | OpenAI API key. Used for resume parsing, job analysis, candidate matching, embeddings, and semantic search |

### Resend

| Variable | Required | Scope | Description |
| -------- | -------- | ----- | ----------- |
| `RESEND_API_KEY` | Yes | Server | Resend API key |
| `RESEND_FROM_EMAIL` | Yes | Server | Verified sender, e.g. `HireMatch AI <noreply@yourdomain.com>` |

### Vercel environment targets

| Environment | When to use |
| ----------- | ----------- |
| **Production** | Live domain |
| **Preview** | Pull request deployments (use staging Supabase or separate project) |
| **Development** | Optional local overrides via Vercel CLI |

> **Tip:** Mark all server-only variables as available only in Production and Preview, not exposed to the browser. Only `NEXT_PUBLIC_*` variables are sent to the client.

---

## Supabase Setup

### 1. Create a project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. Copy **Project URL** and **anon key** into `.env`.
3. Copy **service role key** into `SUPABASE_SERVICE_ROLE_KEY` (server only).

### 2. Database

1. Open **Project Settings → Database**.
2. Copy the **Connection string** (URI).
3. Set `DATABASE_URL` to the **Transaction pooler** string (port `6543`).
4. Set `DIRECT_URL` to the **Direct** string (port `5432`) for migrations.

Apply schema:

```bash
npm run db:generate
npm run db:migrate        # local
# production:
npx prisma migrate deploy
```

### 3. Authentication

1. **Authentication → Providers → Email** — enable Email sign-in.
2. **Authentication → URL Configuration:**
   - **Site URL:** `https://your-domain.com` (production) or `http://localhost:3000` (local)
   - **Redirect URLs:**
     - `http://localhost:3000/auth/callback`
     - `https://your-domain.com/auth/callback`
     - `https://*.vercel.app/auth/callback` (preview deployments)

3. User roles are stored in Supabase `user_metadata.role`:
   - `HR` — recruiter dashboard
   - `CANDIDATE` — job seeker dashboard
   - `ADMIN` — platform admin (promote manually; not available in public registration)

4. After profile setup, set `user_metadata.profile_completed` to `true`.

**Promote an admin (Supabase Dashboard → Authentication → Users → user → Edit metadata):**

```json
{
  "role": "ADMIN",
  "profile_completed": true,
  "name": "Platform Admin"
}
```

### 4. Storage (resumes)

1. **Storage → New bucket**
   - Name: `resumes`
   - **Public:** off (private bucket)
2. The app uses the **service role** server-side for upload, signed preview URLs, and download.
3. Allowed file types: PDF, DOC, DOCX (max 10 MB).

### 5. Row Level Security (optional hardening)

The app primarily accesses data through Prisma with the database connection string. If you enable RLS on Supabase tables, ensure policies allow your service role / Prisma connection or disable RLS for Prisma-managed tables.

---

## OpenAI Setup

### 1. Create an API key

1. Go to [platform.openai.com](https://platform.openai.com).
2. Create an API key and add it as `OPENAI_API_KEY`.

### 2. Models used

| Feature | Model |
| ------- | ----- |
| Resume parsing & analysis | `gpt-4o-mini` |
| Job description analysis | `gpt-4o-mini` |
| Match explanations | `gpt-4o-mini` |
| Vector embeddings (search & matching) | `text-embedding-3-small` |

### 3. Production recommendations

- Set **usage limits** and billing alerts in the OpenAI dashboard.
- Monitor token usage from resume uploads and global semantic search.
- Embeddings are generated on resume parse and during search backfill — budget accordingly.
- Without `OPENAI_API_KEY`, AI features fail gracefully but matching/search scores will be degraded.

### 4. Rate limits

For high traffic, consider:

- Queueing resume parse jobs (currently synchronous)
- Batch embedding backfill instead of on-demand during search
- Caching match results in `CandidateRanking` and `ResumeAnalysis` tables

---

## Resend Setup

### 1. Create an account and API key

1. Sign up at [resend.com](https://resend.com).
2. Create an API key → set `RESEND_API_KEY`.

### 2. Verify your sending domain

1. **Domains → Add Domain** — add your production domain (e.g. `hirematch.ai`).
2. Add the DNS records Resend provides (SPF, DKIM, DMARC).
3. Set `RESEND_FROM_EMAIL` to a verified address:

```env
RESEND_FROM_EMAIL=HireMatch AI <noreply@yourdomain.com>
```

### 3. Email types sent by the app

- Welcome emails
- Application received / status updates
- Interview invites
- Job match notifications
- Password reset (if enabled via Supabase + custom templates)

### 4. Production tips

- Use a dedicated subdomain for transactional mail (e.g. `noreply@mail.yourdomain.com`).
- Enable webhook logging in Resend for delivery monitoring.
- Email records are stored in the `emails` Prisma table for audit.

---

## Prisma Commands

| Command | Description |
| ------- | ----------- |
| `npm run db:generate` | Generate Prisma Client after schema changes |
| `npm run db:migrate` | Create and apply migrations (development) |
| `npx prisma migrate deploy` | Apply pending migrations (production CI/CD) |
| `npm run db:push` | Push schema without migration files (prototyping only) |
| `npm run db:seed` | Seed sample data (**development only**) |
| `npm run db:reset` | Reset database and re-seed (**destructive, dev only**) |
| `npm run db:studio` | Open Prisma Studio GUI |

### Production migration workflow

```bash
# 1. Generate client (also runs on postinstall)
npm run db:generate

# 2. Deploy migrations against production DB (uses DIRECT_URL if configured)
npx prisma migrate deploy
```

**Vercel build command (recommended):**

```bash
DATABASE_URL="$DIRECT_URL" npx prisma migrate deploy && npm run build
```

Set both `DATABASE_URL` (pooled, for runtime) and `DIRECT_URL` (direct, for migrations) in Vercel. The build command temporarily uses the direct URL for migrations only.

---

## Build Commands

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start dev server with Turbopack (`http://localhost:3000`) |
| `npm run build` | Production build (Turbopack) |
| `npm run start` | Start production server locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting (CI) |

### Pre-deploy build check

```bash
npm run db:generate
npm run build
npm run lint
```

All dashboard routes use `force-dynamic` and require a live database at runtime.

---

## Deploy to Vercel

### 1. Connect the repository

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Next.js** (auto-detected).
3. Root directory: `./`

### 2. Configure build settings

| Setting | Value |
| ------- | ----- |
| **Build Command** | `DATABASE_URL="$DIRECT_URL" npx prisma migrate deploy && npm run build` |
| **Install Command** | `npm install` |
| **Output Directory** | `.next` (default) |
| **Node.js Version** | 20.x |

Alternatively use the included `vercel.json`.

### 3. Add environment variables

Add every variable from [Environment Variables](#environment-variables) in **Vercel → Settings → Environment Variables**.

Minimum required for a working deployment:

```
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_APP_NAME
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
```

Set `NEXT_PUBLIC_APP_URL` to your production domain **before** the first production deploy.

### 4. Custom domain

1. **Vercel → Settings → Domains** — add your domain.
2. Update Supabase **Site URL** and **Redirect URLs** to match.
3. Update `NEXT_PUBLIC_APP_URL` in Vercel to `https://your-domain.com`.
4. Redeploy.

### 5. Post-deploy verification

1. Landing page loads at your domain.
2. Register as HR and Candidate on separate accounts.
3. Complete profile setup flow.
4. HR: create a job, run AI matching.
5. Candidate: upload resume, apply to a job.
6. Verify email delivery in Resend dashboard.
7. Admin: access `/dashboard/admin` with an `ADMIN` metadata user.

### 6. Preview deployments

Each pull request gets a preview URL. Add `https://*.vercel.app/auth/callback` to Supabase redirect URLs, or use a dedicated staging Supabase project.

---

## Optimize Performance

### Serverless & database

- Use **Supabase connection pooler** (`DATABASE_URL` port 6543) to avoid exhausting Postgres connections on Vercel.
- Set `connection_limit=1` in the pooled URL for serverless functions.
- Keep Prisma queries scoped — HR queries filter by `postedById`; admin queries are platform-wide and should be paginated before scaling.

### Next.js

- Production build uses Turbopack (`next build --turbopack`).
- Dashboard pages are server-rendered (`force-dynamic`) for fresh data — expected for authenticated apps.
- Static landing page (`/`) is pre-rendered for fast first paint.

### AI & embeddings

- Resume embeddings are indexed on parse; search backfills missing embeddings lazily.
- For large candidate pools, add a background job to batch-index embeddings instead of indexing during search.
- Consider upgrading to **pgvector** in PostgreSQL for scalable vector search at high volume.

### Assets & caching

- Use Vercel Edge caching for static assets automatically.
- Resume files stay in private Supabase Storage with short-lived signed URLs (1 hour default).
- Enable **Vercel Analytics** and **Speed Insights** for Core Web Vitals monitoring.

### Recommended Vercel settings

- **Function region:** Same region as Supabase (e.g. `iad1` for US East).
- **Fluid compute / increased timeout** for resume upload + OpenAI parse routes if uploads timeout (default 10s on Hobby).

---

## SEO

### Built-in metadata

Root layout (`app/layout.tsx`) sets:

- Page title template (`%s | HireMatch AI`)
- Meta description and keywords
- Open Graph and Twitter card tags
- `metadataBase` from `NEXT_PUBLIC_APP_URL`

### Crawling

- `app/robots.ts` — allows indexing of public pages, blocks authenticated dashboard routes.
- `app/sitemap.ts` — includes public marketing and auth pages.

### Production SEO checklist

- [ ] Set `NEXT_PUBLIC_APP_URL` to the canonical production domain
- [ ] Add a custom favicon and OG image in `app/` (optional enhancement)
- [ ] Submit sitemap to Google Search Console: `https://your-domain.com/sitemap.xml`
- [ ] Verify `robots.txt` at `https://your-domain.com/robots.txt`
- [ ] Dashboard routes (`/dashboard/*`) are excluded from the sitemap

---

## Security

### Authentication & authorization

- Supabase handles password hashing and session tokens.
- Middleware enforces role-based access: `HR`, `CANDIDATE`, `ADMIN` cannot cross-access dashboards.
- `requireRole()` guards server components and actions.
- Profile completion required before dashboard access.

### HTTP security headers

Set in `middleware.ts` and `vercel.json`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Secrets

| Secret | Handling |
| ------ | -------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only — bypasses RLS; never use in client code |
| `OPENAI_API_KEY` | Server only |
| `RESEND_API_KEY` | Server only |
| `DATABASE_URL` | Server only |

Never commit `.env`. Use Vercel encrypted environment variables in production.

### Storage

- Resume bucket is **private**; access via signed URLs and server-side service role.
- File type and size validation before upload (PDF/DOC/DOCX, 10 MB max).

### Admin access

- `ADMIN` role is not exposed in public registration.
- Promote admins via Supabase user metadata or direct database update.
- Admin accounts cannot be deactivated from the admin UI.

### Production hardening checklist

- [ ] Enable Supabase **Leaked Password Protection**
- [ ] Configure Supabase **rate limiting** on auth endpoints
- [ ] Use a verified custom domain for Resend (SPF/DKIM/DMARC)
- [ ] Rotate API keys periodically
- [ ] Enable Vercel **Deployment Protection** for preview environments
- [ ] Review Supabase audit logs regularly
- [ ] Do not run `db:seed` or `db:reset` against production

---

## Testing Checklist

Use this before and after every production deploy.

### Environment & build

- [ ] All required environment variables set in Vercel
- [ ] `NEXT_PUBLIC_APP_URL` matches production domain
- [ ] `npx prisma migrate deploy` succeeds
- [ ] `npm run build` passes without errors
- [ ] `npm run lint` passes

### Authentication

- [ ] Register new HR account → profile setup → `/dashboard/hr`
- [ ] Register new Candidate account → profile setup → `/dashboard/candidate`
- [ ] Login / logout works
- [ ] Wrong-role user redirected away from other dashboards
- [ ] Unauthenticated user redirected to `/login` from `/dashboard/*`
- [ ] OAuth callback works at `/auth/callback`

### HR workflow

- [ ] Create job posting
- [ ] View applicants list
- [ ] Run AI candidate matching on a job
- [ ] View candidate rankings
- [ ] Global semantic search returns results with score breakdown
- [ ] View HR candidate profile and resume preview
- [ ] Analytics dashboard loads charts
- [ ] Email candidates form sends (check Resend)

### Candidate workflow

- [ ] Upload resume (PDF) — parses successfully
- [ ] View extracted resume data and ATS analysis
- [ ] Browse recommended jobs
- [ ] One-click apply to a job
- [ ] View application status
- [ ] Notifications page loads

### Admin workflow

- [ ] Admin user reaches `/dashboard/admin`
- [ ] Users, HR, Candidates, Jobs, Applications pages load
- [ ] Activate/deactivate non-admin user
- [ ] Analytics and Reports pages load
- [ ] System settings save successfully

### Integrations

- [ ] OpenAI resume parsing returns structured data
- [ ] Embeddings generated on resume parse (check `Resume.embedding` in DB)
- [ ] Resend delivers welcome / application emails
- [ ] Supabase Storage upload and signed preview URL work
- [ ] Resume download API works for authorized users

### SEO & public pages

- [ ] Landing page renders correctly
- [ ] `/sitemap.xml` accessible
- [ ] `/robots.txt` accessible
- [ ] Page title and meta description present (view source)

### Performance & security

- [ ] Landing page Lighthouse score acceptable (Performance, SEO)
- [ ] No secrets in client bundle (check Network → JS for API keys)
- [ ] Security headers present (check Response Headers in DevTools)
- [ ] HTTPS enforced on production domain

---

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login, register
│   ├── dashboard/          # HR, Candidate, Admin dashboards
│   ├── api/                # API routes (resume upload/download)
│   └── auth/callback/      # Supabase OAuth callback
├── actions/                # Server actions
├── ai/                     # OpenAI client, embeddings, prompts
├── components/             # UI, dashboards, landing
├── emails/                 # Email templates
├── lib/                    # Auth, Prisma, Supabase, queries
├── middleware.ts           # Auth, RBAC, security headers
├── prisma/                 # Schema, migrations, seed
├── services/               # Business logic (matching, search, email)
└── types/                  # Shared TypeScript types
```

---

## Authentication & Roles

| Role | Dashboard | Description |
| ---- | --------- | ----------- |
| `HR` | `/dashboard/hr` | Recruiters — jobs, applicants, matching, analytics |
| `CANDIDATE` | `/dashboard/candidate` | Job seekers — resume, applications, recommendations |
| `ADMIN` | `/dashboard/admin` | Platform admin — users, jobs, analytics, settings |

### Auth flow

1. **Register** at `/register` — select HR or Candidate
2. **Profile setup** at `/profile` — required on first login
3. **Dashboard redirect** based on role

Roles sync from Supabase `user_metadata` to the Prisma `User` table on login.

---

## License

Private — All rights reserved.
