# Running this project locally

This is the "what do I actually type" guide for working on your own machine.
Deployment is a separate file: **[DEPLOY.md](./DEPLOY.md)**.

Your machine is already set up (Node 20, the `portfolio-pg` Docker container,
and a filled-in `.env`). So skip to **Part 2** for the everyday routine — Part 1
is only for a fresh machine or if you ever wipe things.

---

## Part 1 — First-time setup (only once per machine)

### Step 1. Node

```bash
node -v        # must print v20.x
nvm use        # if it doesn't — reads .nvmrc
```

### Step 2. Install packages

```bash
npm install
```

This also runs `prisma generate` automatically (the `postinstall` script), which
creates the typed database client. You never run `prisma generate` by hand.

### Step 3. Start a local Postgres database

You do **not** need to install Postgres. One Docker command creates it:

```bash
docker run -d --name portfolio-pg \
  -e POSTGRES_USER=portfolio \
  -e POSTGRES_PASSWORD=devpass \
  -e POSTGRES_DB=portfolio \
  -p 5433:5432 postgres:16-alpine
```

Port **5433**, not 5432 — you already have another Postgres on 5432 from a
different project (`us_app_backend-postgres-1`). Using 5433 keeps them apart.

This container is your *local* database. It has nothing to do with production.
Production gets its own database in the cloud — see DEPLOY.md.

### Step 4. Create `.env`

```bash
cp .env.example .env
```

Then fill it in. This is what a working local `.env` looks like:

```bash
# Points at the Docker container from Step 3
DATABASE_URL="postgresql://portfolio:devpass@localhost:5433/portfolio?schema=public&connection_limit=5&pool_timeout=20"
DIRECT_URL="postgresql://portfolio:devpass@localhost:5433/portfolio?schema=public"

# Signs your admin login cookie. Generate with: openssl rand -base64 32
AUTH_SECRET="paste-at-least-32-characters-here"

# Only read by the seed script, to create your admin account
ADMIN_EMAIL="you@example.com"
ADMIN_NAME="AZM Mehedi Hasan"
ADMIN_PASSWORD="pick-a-strong-one"

# Optional locally — leave empty and the app still runs
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
RESEND_API_KEY=""
CONTACT_TO_EMAIL="you@example.com"
```

Notes:

- `.env` is in `.gitignore`. It never gets committed, and Vercel never sees it.
  Production values are typed into the Vercel dashboard by hand.
- `DATABASE_URL` vs `DIRECT_URL`: locally they're the same database. The split
  only matters in production, where one goes through a connection pooler and
  migrations need the un-pooled one.
- `connection_limit=5` is not optional. `npm run build` renders pages in
  parallel workers; without the cap Postgres answers `too many clients already`.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` exists in `.env.example` but nothing in
  the code reads it. Ignore it.

### Step 5. Create the tables

```bash
npm run db:migrate
```

This replays `prisma/migrations/` into your empty database. Tables now exist,
but they're empty.

### Step 6. Load content + create your admin account

```bash
npm run db:seed
```

This does two things:

1. Fills the database from `prisma/seed-content/` — your projects, articles,
   page copy, tech stack, timeline, nav links.
2. Creates the admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

There is no signup page anywhere in the app. Seeding is the only way an admin
account is ever created.

### Step 7. Run it

```bash
npm run dev
```

- Public site → http://localhost:3000
- Admin login → http://localhost:3000/admin/login

Sign in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env`.

---

## Part 2 — Your everyday routine

Your container already exists, so **do not run `docker run` again** — it will
fail with "name already in use". Just start it:

```bash
docker start portfolio-pg     # the DB stops when you reboot; this wakes it up
npm run dev                   # → http://localhost:3000
```

That's it. Two commands, every day.

To check the database is actually up:

```bash
docker ps --filter name=portfolio-pg
```

If it's not listed, `docker start portfolio-pg` again. Every "can't reach
database server at localhost:5433" error is this and nothing else.

When you're done:

```bash
docker stop portfolio-pg      # optional — it's fine to leave it running
```

---

## Part 3 — The database, day to day

### What lives where

Every piece of content on the site is a **row in Postgres**, not a file. There
are no MDX files to edit anymore — articles and case studies are stored as MDX
*text in a database column* and rendered at request time.

So: to change site content, you sign in at `/admin` and edit it. You do not
touch code, and you do not deploy.

### The three commands you'll actually use

```bash
npm run db:studio     # visual browser for your data (opens in the browser)
npm run db:seed       # top up missing content — safe, never overwrites
npm run db:migrate    # ONLY after you edit prisma/schema.prisma
```

### When do I run `db:migrate`?

Only when you change the *shape* of the data — you edited
`prisma/schema.prisma` to add a field, a model, or an index.

```bash
# 1. edit prisma/schema.prisma
npm run db:migrate      # Prisma asks for a name, e.g. "add_project_repo_url"
# 2. commit the new folder under prisma/migrations/
```

**Committing the migration folder is the part people forget.** Production
replays those SQL files on deploy. A schema change pushed without its migration
will not deploy.

Adding a *project* or an *article* is not a schema change. That's just data —
do it in the admin.

### Re-seeding

```bash
npm run db:seed         # fills gaps only, never overwrites your admin edits
npm run db:seed:force   # rewrites packaged content, DISCARDING your edits
```

Use `db:seed:force` when you've broken a page in the admin and want the original
copy back.

### Starting over

```bash
npm run db:reset        # drops everything, re-migrates, re-seeds
```

Local only. Never point this at production.

---

## Part 4 — Images locally

### How uploading works

The admin has a media library at `/admin/media`. When you pick a file:

1. The browser asks your own server for a signed upload ticket
   (`POST /api/media/sign`) — this needs your Cloudinary secret, server-side.
2. The browser sends the file **straight to Cloudinary**. It never passes
   through your app.
3. Cloudinary's response URL is recorded as a `MediaAsset` row.

Limit: 10 MB per file. Everything lands in a Cloudinary folder called
`portfolio`.

### Right now, uploads don't work locally — and that's fine

Your three `CLOUDINARY_*` values are empty, so the upload button answers
*"Cloudinary is not configured"*. Nothing else breaks.

You have two options:

**Option A — paste image URLs instead (zero setup).**
Every image field in the admin accepts a plain URL. Already-allowed hosts:

- `res.cloudinary.com`
- `images.unsplash.com`
- `i.ibb.co`

Any other host throws a Next.js Image error until you add it to
`remotePatterns` in `next.config.mjs`.

**Option B — use the real Cloudinary uploader locally too.**
Create the free account described in DEPLOY.md, then put the same three values
in your local `.env`.

Cloudinary's dashboard shows them as one combined line, not three fields:

```
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

Split it — the app reads three separate variables and ignores `CLOUDINARY_URL`:

```bash
CLOUDINARY_CLOUD_NAME="rjkkzpda"              # after the @
CLOUDINARY_API_KEY="249586731045829"          # between // and :
CLOUDINARY_API_SECRET="aB3xK9_pQ7tR2vN8mL4"   # between : and @
```

Reveal the secret on the dashboard first (eye toggle, or Settings → API Keys) —
copying it while masked gives you the literal `<your_api_secret>` placeholder.

Restart `npm run dev` — env changes are only read at startup.

⚠️ Local and production would then share one Cloudinary account, so test
uploads show up in your production media library. For a portfolio that's
harmless. Delete the test images when you're done.

**Never** rename `CLOUDINARY_API_SECRET` to `NEXT_PUBLIC_CLOUDINARY_API_SECRET`.
Anything with the `NEXT_PUBLIC_` prefix is compiled into JavaScript that every
visitor downloads.

---

## Part 5 — Email locally

`RESEND_API_KEY` is empty, so the contact form **still works** — the message is
saved to the database and shows up under `/admin/messages`. Only the "email me
a copy" step is skipped. You don't need Resend to develop.

---

## Part 6 — Tests

```bash
npm test          # Vitest — fast, no server needed
npm run build     # required before e2e (Playwright runs the production build)
npm run e2e       # Playwright — full browser run
```

The e2e suite writes real rows (prefixed `E2E ` / `e2e-`) and cleans up after
itself. Run it against your local database only — **never** against production.

If a run is interrupted and leaves junk behind:

```bash
npm run db:clean-test-data
```

---

## Part 7 — When something is wrong locally

| What you see | What it means |
| --- | --- |
| `Can't reach database server at localhost:5433` | The container is stopped → `docker start portfolio-pg` |
| `docker: name "portfolio-pg" is already in use` | It already exists → `docker start portfolio-pg`, don't `docker run` |
| `SiteSettings row is missing` | Tables exist, content doesn't → `npm run db:seed` |
| `too many clients already` during `npm run build` | `connection_limit=5` is missing from `DATABASE_URL`, or a stray `npm run dev` is still holding connections |
| Login bounces back to `/admin/login` | `AUTH_SECRET` is missing or shorter than 32 characters |
| Login says wrong password | The admin user was never seeded → `npm run db:seed` |
| "Cloudinary is not configured" | Expected — see Part 4 |
| Changed `.env` but nothing changed | Restart `npm run dev` |
| `Invalid src prop … hostname not configured` | The image URL's host isn't in `next.config.mjs` → add it to `remotePatterns` |

---

## The mental model, in four lines

- **Code** lives in git → changing it means a commit and a deploy.
- **Content** lives in Postgres → changing it means editing at `/admin`, no deploy.
- **Images** live in Cloudinary → only the URL is stored in Postgres.
- **Secrets** live in `.env` locally and in the Vercel dashboard in production —
  never in git, and the two sets are completely separate.
