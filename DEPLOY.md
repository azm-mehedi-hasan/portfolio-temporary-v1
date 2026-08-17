# Deploying this site online

Do these in order. Running locally is a separate file:
**[RUN-LOCAL.md](./RUN-LOCAL.md)**.

Everything below is free-tier. Budget about an hour for the first deploy;
after that, shipping is `git push`.

---

## What you're setting up, and why

Locally you have one machine holding everything. Online, four separate services
each own one piece:

| Piece | Local | Online | Required? |
| --- | --- | --- | --- |
| The app | `npm run dev` | **Vercel** | yes |
| The database | Docker `portfolio-pg` | **Neon** (Postgres) | yes |
| Uploaded images | not working | **Cloudinary** | yes, for uploads |
| Contact email | not working | **Resend** | no |
| Login rate limiting | in-memory | **Upstash Redis** | recommended |

Your local Docker database is **not** copied anywhere. Production starts empty
and gets filled by the seed in Step 7.

---

## Step 1 — Push the code to GitHub

The remote already exists: `github.com/azm-mehedi-hasan/portfolio-temporary-v1`.

```bash
git status          # should be clean
git push origin main
```

Confirm `.env` is **not** in the repo. It's in `.gitignore`, so it shouldn't be:

```bash
git ls-files | grep -c '^\.env$'    # must print 0
```

If that prints 1, stop and remove it from git history before going further —
your database password and `AUTH_SECRET` would be public.

---

## Step 2 — Create the production database (Neon)

1. Sign up at **https://neon.tech** with GitHub.
2. Create a project. Region: pick the one nearest your visitors
   (Singapore/`ap-southeast-1` is closest to Bangladesh).
3. On the connection-details panel, copy **two** strings. This is the part that
   confuses everyone, so read carefully:

   - **Pooled** connection (the one with `-pooler` in the hostname) → this
     becomes `DATABASE_URL`
   - **Direct** connection (no `-pooler`) → this becomes `DIRECT_URL`

4. Add `&connection_limit=5` to the end of the **pooled** one.

They should look roughly like:

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&connection_limit=5"
DIRECT_URL="postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

Why two? Day-to-day queries go through the pooler so hundreds of serverless
functions can share a handful of real connections. But a pooler can't run
`CREATE TABLE`, so migrations need the direct line. Getting these backwards is
the single most common deploy failure — the build dies at
`prisma migrate deploy`.

Keep both strings in a scratch note; you'll paste them twice.

**Do not** put these in your local `.env`. Local stays on Docker.

---

## Step 3 — Create the image host (Cloudinary)

Uploads are already coded and signed server-side. You only need an account.

1. Sign up at **https://cloudinary.com** (free tier: 25 GB, far beyond a
   portfolio's needs).
2. Get your three values — see below.

### Cloudinary shows one URL, not three fields

The current dashboard gives you a single line under **API Environment
variable**:

```
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

This app does **not** read `CLOUDINARY_URL`. `src/lib/cloudinary.ts` reads three
separate variables, so split the URL apart:

```
cloudinary://249586731045829:aB3xK9_pQ7tR2vN8mL4wZ6yH1cE@rjkkzpda
             ───────────────  ───────────────────────────  ────────
             API_KEY          API_SECRET                   CLOUD_NAME
```

- **key** — the digits between `//` and `:` (about 15 digits)
- **secret** — between `:` and `@` (about 27 mixed characters)
- **cloud name** — after the `@`

Which gives you:

```bash
CLOUDINARY_CLOUD_NAME="rjkkzpda"
CLOUDINARY_API_KEY="249586731045829"
CLOUDINARY_API_SECRET="aB3xK9_pQ7tR2vN8mL4wZ6yH1cE"
```

(Those key/secret values are made up — yours are on the dashboard.)

The secret is masked by default. Click the eye / **Reveal** toggle beside it, or
open **Settings → API Keys**, to see the real characters. If you copy the line
while it's still masked you'll paste the literal text `<your_api_secret>` and
every upload will fail.

Pasting the combined `CLOUDINARY_URL` into Vercel does nothing — the app ignores
it and reports "Cloudinary is not configured".

That's the whole setup. Specifically, you do **not** need to:

- create an upload preset — uploads are signed per-request by
  `/api/media/sign`, not preset-based;
- create the `portfolio` folder — Cloudinary makes it on the first upload;
- configure CORS — the browser posts directly to Cloudinary's own API.

Two rules:

- `CLOUDINARY_API_SECRET` must **never** get a `NEXT_PUBLIC_` prefix. It signs
  uploads and deletions; prefixing it ships it to every visitor's browser.
- After your first successful upload, go to **Settings → Security** and restrict
  delivery to your own domain. Uploads are already authenticated (admin session
  required), but this stops others hotlinking your bandwidth.

If you skip Cloudinary entirely, the site still deploys and runs — the upload
button just answers "Cloudinary is not configured", and you paste image URLs by
hand instead.

---

## Step 4 — Optional services

### Contact email (Resend)

Without it, contact messages are still saved and readable at `/admin/messages`.
You just don't get an email.

1. Sign up at **https://resend.com**, create an API key → `RESEND_API_KEY`.
2. `CONTACT_TO_EMAIL` = where messages land, e.g. your Gmail.
3. `CONTACT_FROM_EMAIL` is optional. Leave it unset and mail goes out as
   `onboarding@resend.dev`, which works immediately but often lands in spam. To
   send as `you@yourdomain.com`, verify that domain in Resend first (DNS
   records) — otherwise Resend rejects the send.

### Rate limiting (Upstash) — recommended

`src/lib/rate-limit.ts` protects the login and contact endpoints. With no Redis
configured it falls back to an in-memory counter, which on serverless resets
whenever a new instance spins up — it slows a brute-force attempt down but
doesn't stop it.

1. Sign up at **https://upstash.com** → create a Redis database (free tier).
2. Copy the **REST** URL and token (not the `redis://` one):

```bash
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXxxx..."
```

### A fresh production `AUTH_SECRET`

Generate a new one — don't reuse your local value:

```bash
openssl rand -base64 32
```

Rotating this later signs you out of the admin. That's the only consequence.

---

## Step 5 — Import the project into Vercel

1. Sign up at **https://vercel.com** with the same GitHub account.
2. **Add New → Project** → pick `portfolio-temporary-v1` → Import.
3. Framework preset: Next.js (auto-detected). Root directory: `./`.
4. **Do not deploy yet.** Set the environment variables first (Step 6) —
   a deploy without `DATABASE_URL` fails at build.

---

## Step 6 — Environment variables and build command

### 6a. Environment variables

Vercel → your project → **Settings → Environment Variables**. Add each one and
tick **Production** and **Preview**.

| Variable | Value | Needed for |
| --- | --- | --- |
| `DATABASE_URL` | Neon **pooled** + `&connection_limit=5` | required |
| `DIRECT_URL` | Neon **direct** | required — migrations |
| `AUTH_SECRET` | fresh `openssl rand -base64 32` | required — admin login |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` | sitemap + robots.txt |
| `CLOUDINARY_CLOUD_NAME` | from Step 3 | image uploads |
| `CLOUDINARY_API_KEY` | from Step 3 | image uploads |
| `CLOUDINARY_API_SECRET` | from Step 3 | image uploads |
| `RESEND_API_KEY` | from Step 4 | contact email |
| `CONTACT_TO_EMAIL` | your inbox | contact email |
| `CONTACT_FROM_EMAIL` | verified sender | optional |
| `UPSTASH_REDIS_REST_URL` | from Step 4 | rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | from Step 4 | rate limiting |

**Do not add `ADMIN_EMAIL`, `ADMIN_NAME`, or `ADMIN_PASSWORD` here.** Nothing at
runtime reads them — only the seed script does, and you run that from your own
machine in Step 7. Keeping your admin password out of the hosting dashboard is
the point.

Don't know your URL yet for `NEXT_PUBLIC_SITE_URL`? Put
`https://portfolio-temporary-v1.vercel.app` for now and correct it in Step 8.
Until it's right, `sitemap.xml` and `robots.txt` advertise a hardcoded fallback
domain — cosmetic, but wrong for SEO.

### 6b. Build command — the step that's easy to miss

Settings → **General → Build & Development Settings** → Build Command →
**Override**:

```
prisma migrate deploy && next build
```

This applies pending migrations *before* pages are rendered. Without it, your
first deploy builds against a database with no tables and every page errors.

`prisma generate` is already handled by the `postinstall` script in
`package.json` — you don't add it here.

---

## Step 7 — Deploy, then seed once

### 7a. Deploy

Hit **Deploy**. Watch the build log. You should see Prisma applying the `init`
migration, then Next building. This takes a couple of minutes.

The site is now live — and completely empty. Pages will error or render blank,
because there's no `SiteSettings` row yet. That's expected.

### 7b. Seed production (one time only)

Run this **from your own machine**, pointing at Neon. This is the only time you
ever aim a command at the production database:

```bash
DATABASE_URL="<neon pooled url>" \
DIRECT_URL="<neon direct url>" \
ADMIN_EMAIL="you@example.com" \
ADMIN_NAME="AZM Mehedi Hasan" \
ADMIN_PASSWORD="<a strong password>" \
npx tsx prisma/seed.ts
```

This loads your content and creates the production admin account. Use a
**different, strong** password from your local one — this one is on the public
internet.

Prefix the line with a space so it stays out of `~/.bash_history`, or clear it
afterwards with `history -d`.

The seed is idempotent — re-running it only fills gaps, it never overwrites
what you've edited in the admin. Just never run `db:reset` or `db:seed:force`
against Neon.

### 7c. Sign in

Go to `https://your-app.vercel.app/admin/login` and sign in with the email and
password you just used. If it works, you're deployed.

---

## Step 8 — Finish up

1. **Custom domain** (optional): Vercel → Settings → Domains → add it, follow
   the DNS instructions.
2. **Correct `NEXT_PUBLIC_SITE_URL`** to the final domain, then redeploy
   (Deployments → ⋯ → Redeploy). `NEXT_PUBLIC_*` values are baked in at build
   time, so editing the variable alone changes nothing until you rebuild.
3. **Lock down Cloudinary** delivery to your domain (Step 3).
4. **Preview deploys**: every branch/PR gets its own URL, but they share
   production's env vars — so a preview writes to your **real** database. If
   that bothers you, create a Neon **branch** and point the Preview environment
   at it. For a solo portfolio, just don't run tests against previews.
5. **Never run `npm run e2e` against production** — it creates and deletes real
   rows.

---

## Life after the first deploy

### Changing content — projects, articles, text, images

Sign in at `/admin` and edit. **No deploy, no git, no commands.** Saving calls
`revalidatePath()`, so the public page updates within seconds. Pages also
re-check hourly on their own.

This covers: projects, blog posts, timeline, tech stack, gallery, nav links,
socials, page copy, SEO fields, avatar, resume.

### Changing code

```bash
git add -A
git commit -m "..."
git push origin main
```

Vercel builds and deploys automatically. Watch the log; if it fails the previous
version stays live.

### Changing the database schema

```bash
# 1. edit prisma/schema.prisma
npm run db:migrate            # applies it locally + writes prisma/migrations/<...>
git add prisma/migrations     # ← must be committed
git commit -m "..." && git push
```

Vercel's build command replays the migration against Neon. **Never** run
`prisma migrate dev` against production — `migrate deploy` in the build command
is the only thing that should touch its schema.

### Backups

Neon's free tier has no point-in-time restore. Dump periodically:

```bash
pg_dump "<neon pooled url>" --no-owner --format=custom --file=backup-$(date +%F).dump
```

Restore with `pg_restore --dbname "<url>" --clean --no-owner backup-....dump`.
Keep the dumps somewhere other than Vercel.

---

## When a deploy goes wrong

| Symptom | Cause |
| --- | --- |
| Build fails at `prisma migrate deploy` | `DIRECT_URL` is pointing at the **pooled** string. A pooler can't run DDL. |
| Build fails, `too many clients already` | `&connection_limit=5` missing from `DATABASE_URL`. |
| Build fails, `Environment variable not found: DATABASE_URL` | Variable not set for the environment being built (check Production **and** Preview boxes). |
| Site loads but every page errors / `SiteSettings row is missing` | Step 7b never ran. Seed production. |
| `/admin/login` accepts nothing | The admin user wasn't created — re-run the seed with `ADMIN_EMAIL`/`ADMIN_PASSWORD` set. |
| Login succeeds then bounces back to the login page | `AUTH_SECRET` is missing, under 32 chars, or was changed after you signed in. |
| "Cloudinary is not configured" | One of the three `CLOUDINARY_*` vars is missing in that environment. |
| Uploads fail with a Cloudinary error | Wrong `CLOUDINARY_API_SECRET`, or the cloud name doesn't match the key pair. |
| Images 404 or `hostname not configured` | The host isn't in `remotePatterns` in `next.config.mjs` — currently `res.cloudinary.com`, `images.unsplash.com`, `i.ibb.co`. |
| Contact form works but no email arrives | `RESEND_API_KEY` unset (message is still saved in `/admin/messages`), or `CONTACT_FROM_EMAIL` uses an unverified domain. |
| `sitemap.xml` shows the wrong domain | `NEXT_PUBLIC_SITE_URL` wrong, or right but not redeployed since. |
| Admin edit doesn't show on the public page | Check the save actually succeeded (a toast appears), then hard-refresh. If still stale, check Vercel function logs. |

---

## The short version

```
1. git push
2. Neon        → DATABASE_URL (pooled) + DIRECT_URL (direct)
3. Cloudinary  → 3 keys, nothing else to configure
4. Upstash / Resend (optional)
5. Vercel: import repo, paste env vars, build command:
       prisma migrate deploy && next build
6. Deploy
7. Seed production once from your laptop  →  sign in at /admin
8. Set the real domain in NEXT_PUBLIC_SITE_URL, redeploy
```

After that: content changes need no deploy, code changes need `git push`.
