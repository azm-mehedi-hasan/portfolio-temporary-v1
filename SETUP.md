# Setup & Operations

Everything on the public site is stored in Postgres and edited at `/admin`.
This document covers running it locally, working with Prisma, and deploying to
Vercel.

---

## 1. Local development

### Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node | 20.x | `.nvmrc` pins it — run `nvm use`. Next 14 needs ≥ 18.17. |
| npm | 10.x | Ships with Node 20. |
| Postgres | 14+ | Docker is easiest; see below. |

### First run

```bash
nvm use                 # reads .nvmrc → Node 20
npm install             # also runs `prisma generate` via postinstall

# Start a local database (skip if you already have Postgres)
docker run -d --name portfolio-pg \
  -e POSTGRES_USER=portfolio \
  -e POSTGRES_PASSWORD=devpass \
  -e POSTGRES_DB=portfolio \
  -p 5433:5432 postgres:16-alpine

cp .env.example .env    # then fill in the values below
npm run db:migrate      # create the tables
npm run db:seed         # load your content + create the admin user
npm run dev             # → http://localhost:3000
```

Sign in at **http://localhost:3000/admin/login** with the `ADMIN_EMAIL` and
`ADMIN_PASSWORD` from your `.env`.

### `.env` for local development

```bash
DATABASE_URL="postgresql://portfolio:devpass@localhost:5433/portfolio?schema=public&connection_limit=5&pool_timeout=20"
DIRECT_URL="postgresql://portfolio:devpass@localhost:5433/portfolio?schema=public"

AUTH_SECRET="<at least 32 characters>"   # openssl rand -base64 32

ADMIN_EMAIL="you@example.com"
ADMIN_NAME="Your Name"
ADMIN_PASSWORD="<pick a strong one>"     # only read by the seed script

# Optional locally — features degrade gracefully when unset
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
RESEND_API_KEY=""
CONTACT_TO_EMAIL="you@example.com"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

> **`connection_limit=5` matters.** `next build` renders pages in parallel
> worker processes and each opens its own Prisma pool. Without a cap the build
> exhausts Postgres with `too many clients already`.

---

## 2. Prisma

### The three commands you'll actually use

```bash
npm run db:migrate      # after editing prisma/schema.prisma — creates + applies a migration
npm run db:studio       # browse and edit rows in a GUI
npm run db:seed         # load packaged content (safe to re-run)
```

### Changing the schema

1. Edit `prisma/schema.prisma`.
2. `npm run db:migrate` — Prisma prompts for a name, writes
   `prisma/migrations/<timestamp>_<name>/migration.sql`, applies it, and
   regenerates the client.
3. **Commit the migration folder.** Production replays these files; a schema
   change without its migration will not deploy.

If Prisma warns that a change will drop data, it is telling you the truth. Add
a nullable column first, backfill it, then make it required in a second
migration.

### Seeding

`npm run db:seed` is **idempotent and non-destructive**: every write is an
upsert with `update: {}`, so re-running it never overwrites something you
edited in the admin. It fills gaps only.

```bash
npm run db:seed          # fill in anything missing (safe, the default)
npm run db:seed:force    # RE-APPLY the packaged content, overwriting edits
```

Use `db:seed:force` to restore a page after an accidental change — it rewrites
projects, articles, page copy and settings from `prisma/seed-content/`.

The admin user is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. There is no
signup route by design: seeding is the only way an account is created. Remove
`ADMIN_PASSWORD` from the environment once you have signed in.

### Resetting

```bash
npm run db:reset         # DROPS EVERYTHING, re-runs migrations, re-seeds
```

Never point this at production. Prisma will ask for confirmation.

To clear only leftovers from an interrupted test run:

```bash
npm run db:clean-test-data
```

### Where the seed content came from

`prisma/seed-content/` holds the Markdown extracted from the original
file-based site. `scripts/extract-content.mjs` produced it once during the
migration and is no longer part of any workflow — safe to delete whenever you
like.

---

## 3. Tests

```bash
npm test        # Vitest — validation schemas, icon allowlist  (15 tests)
npm run e2e     # Playwright — auth, CRUD, public site parity  (37 tests)
npm run e2e:ui  # same, with the interactive runner
```

`npm run e2e` builds nothing itself — run `npm run build` first, since it starts
the production server. The suite creates its own records (prefixed `E2E ` /
`e2e-`) and deletes them again, so it is safe to run repeatedly against your dev
database. **Never run it against production** — it writes real rows.

---

## 4. Deploying to Vercel

### One-time setup

**1. Create the database.** [Neon](https://neon.tech) has a free tier and
branching. From the dashboard copy two connection strings:

- the **pooled** one → `DATABASE_URL` (append `&connection_limit=5`)
- the **direct** one → `DIRECT_URL` (migrations only; PgBouncer can't run DDL)

**2. Set the environment variables** in Vercel → Settings → Environment
Variables. Set them for Production *and* Preview:

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | Pooled connection string |
| `DIRECT_URL` | yes | Direct connection, used by `migrate deploy` |
| `AUTH_SECRET` | yes | `openssl rand -base64 32`. Rotating it signs everyone out. |
| `NEXT_PUBLIC_SITE_URL` | yes | `https://your-domain.com` — used by sitemap and robots |
| `CLOUDINARY_CLOUD_NAME` | for uploads | |
| `CLOUDINARY_API_KEY` | for uploads | |
| `CLOUDINARY_API_SECRET` | for uploads | **Never** prefix with `NEXT_PUBLIC_` |
| `RESEND_API_KEY` | for email | Contact form still saves messages without it |
| `CONTACT_TO_EMAIL` | for email | Where contact messages are delivered |
| `CONTACT_FROM_EMAIL` | optional | Must be a domain verified in Resend |
| `UPSTASH_REDIS_REST_URL` | recommended | Rate limiting for login + contact |
| `UPSTASH_REDIS_REST_TOKEN` | recommended | |

Without Upstash the rate limiter falls back to per-instance memory, which on
serverless slows an attacker down but does not stop one. Set it in production.

**3. Set the build command** in Vercel → Settings → General:

```
prisma migrate deploy && next build
```

This applies pending migrations before the build renders any page. `prisma
generate` already runs through `postinstall`.

**4. Deploy, then seed once.** After the first successful deploy, run the seed
against production from your machine:

```bash
DATABASE_URL="<production pooled url>" \
DIRECT_URL="<production direct url>" \
ADMIN_EMAIL="you@example.com" \
ADMIN_NAME="Your Name" \
ADMIN_PASSWORD="<strong password>" \
npx tsx prisma/seed.ts
```

Sign in at `https://your-domain.com/admin/login`, then remove
`ADMIN_PASSWORD` from your shell history.

**5. Lock down Cloudinary.** In the Cloudinary console restrict uploads to your
domain. Uploads are signed server-side, but the allowlist is the real control.

### Every deploy after that

Push to `main`. Vercel runs `prisma migrate deploy && next build`. Content
changes need no deploy at all — they are database rows, and the admin
revalidates the affected pages on save.

### Preview deployments

Create a Neon **branch** per preview and point the preview environment at it.
Otherwise preview deploys write to production data.

---

## 5. How the site stays fast

Public pages are prerendered and served from cache; the database is not touched
on a normal page view.

```
○  Static   /  /about  /projects  /blog  /contact  /resume  /sitemap.xml  /robots.txt
●  SSG      /projects/[slug]  /blog/[slug]      ← prerendered per slug
ƒ  Dynamic  /admin/*                            ← always fresh, behind auth
```

When you save in the admin, the action calls `revalidatePath()` for the pages
that changed, so edits appear within seconds without a rebuild. Pages also
revalidate hourly on their own as a backstop.

Two structural notes worth knowing before you change routing:

- **There is no `loading.tsx` under `(site)`, on purpose.** A loading file wraps
  the segment in Suspense, which makes Next start streaming. Once the first
  bytes are flushed the HTTP status is already sent, so a later `notFound()`
  cannot turn a 200 into a 404 — every missing project or article would answer
  as a soft 404 and get indexed as a real page. Public pages are prerendered, so
  a skeleton buys nothing. The admin has one, because it is genuinely dynamic.
- **`robots.ts` must live at `src/app/`,** not inside a route group. `sitemap.ts`
  works from either place; `robots.ts` silently produces no route from within a
  group.

---

## 6. Troubleshooting

**`too many clients already` during build** — add `&connection_limit=5` to
`DATABASE_URL`, and make sure no stray dev servers are holding connections.

**`SiteSettings row is missing`** — the database has tables but no content. Run
`npm run db:seed`.

**Admin edits don't appear on the site** — check the action returned success
(a toast appears). If it did, the page is cached; `revalidatePath` runs on save,
but a hard refresh confirms it. Failing that, check the Vercel function logs.

**Sign-in loops back to the login page** — `AUTH_SECRET` differs between the
build and runtime environments, or is under 32 characters.

**Uploads say "Cloudinary is not configured"** — the three `CLOUDINARY_*`
variables are not all set in that environment. You can still paste image URLs
into any image field.

**`prisma migrate deploy` fails on Vercel** — `DIRECT_URL` is probably pointing
at the pooled connection. Migrations need the direct one.

---

## 7. Backups

Neon keeps point-in-time restore on paid plans; the free tier does not. For a
portfolio, a periodic dump is enough:

```bash
pg_dump "$DATABASE_URL" --no-owner --format=custom --file=backup-$(date +%F).dump
```

Keep the dumps somewhere off Vercel. Restoring:

```bash
pg_restore --dbname "$DATABASE_URL" --clean --no-owner backup-2026-08-16.dump
```
