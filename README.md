# Portfolio + Admin CMS

Personal portfolio for AZM Mehedi Hasan, with a database-backed admin dashboard.
Every piece of content on the public site — projects, articles, timeline, tech
stack, gallery, navigation, page copy, SEO — is edited at `/admin` and goes live
without a deploy.

## Stack

- **Next.js 14** (App Router, Server Actions) · TypeScript · Tailwind CSS
- **PostgreSQL + Prisma** for all content
- **next-mdx-remote** renders article and case-study bodies stored as MDX
- **Cloudinary** for uploaded images · **Resend** for contact email
- **Vercel** hosting
- **Playwright** + **Vitest** for tests

## Quick start

```bash
nvm use            # Node 20
npm install
cp .env.example .env    # fill in DATABASE_URL, AUTH_SECRET, ADMIN_*
npm run db:migrate
npm run db:seed
npm run dev             # → http://localhost:3000
```

Admin: **http://localhost:3000/admin/login**

Full instructions — Prisma workflows, deployment, troubleshooting — are in
**[SETUP.md](./SETUP.md)**.

## Layout

```
src/
  app/
    (site)/          public site — its own root layout (sidebar shell)
    (admin)/         admin dashboard — its own root layout
    api/media/sign   signed Cloudinary upload params
  components/        shared UI; components/admin/* is dashboard-only
  lib/
    queries.ts       every public read
    actions/         Server Actions (all mutations)
    auth.ts          signed-cookie sessions (jose)
    icons.ts         allowlist mapping stored names → icon components
    validation.ts    zod schemas shared by forms and actions
  middleware.ts      routing guard for /admin
prisma/
  schema.prisma      14 models
  seed.ts            loads prisma/seed-content/
e2e/                 Playwright specs
tests/               Vitest specs
```

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Vitest unit tests |
| `npm run e2e` | Playwright end-to-end tests (build first) |
| `npm run db:migrate` | Create + apply a migration |
| `npm run db:seed` | Load packaged content (safe to re-run) |
| `npm run db:seed:force` | Re-apply packaged content, overwriting edits |
| `npm run db:studio` | Browse the database |
| `npm run db:clean-test-data` | Remove leftover E2E rows |
