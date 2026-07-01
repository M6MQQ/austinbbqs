# 🔥 austinbbqs.com

A showcase of BBQ restaurants in Austin, Texas — with search & filters, a map, public reviews, an
SEO-friendly public site, and a password-protected admin backend. The admin can add restaurants and
photos by hand **or** use a natural-language AI chat (Claude API) that researches a restaurant on the
web and drafts a full entry for review.

## Stack

- **Next.js 15** (App Router, TypeScript) — public site + admin + API in one deployable
- **PostgreSQL + Prisma** — data & migrations
- **Claude API** (`claude-opus-4-8`) with the web-search tool — AI research chat
- **Leaflet + OpenStreetMap** — maps (no API key)
- **Tailwind CSS** — styling
- Images stored on a **Railway Volume**, streamed via `/api/images/...`

## Features

- Public directory with search + filters (specialty, price, neighborhood, amenity)
- Restaurant detail pages: photo gallery, hours + **open-now** badge, map, reviews
- `/map` — all joints on one map
- Public reviews shown immediately, **flaggable** for admin moderation
- SEO: per-page metadata, Open Graph, `sitemap.xml`, `robots.txt`, JSON-LD `Restaurant` schema
- Admin: dashboard (publish/unpublish, flagged-review queue), full editor + image manager
- **AI research chat** → drafts land in the dashboard for review before publishing

## Local development

```bash
# 1. Install deps
npm install

# 2. Configure environment
cp .env.example .env
#   - point DATABASE_URL at a local Postgres
#   - set ADMIN_PASSWORD, SESSION_SECRET, ANTHROPIC_API_KEY
#   - UPLOAD_DIR can be left unset locally (defaults to ./.data/uploads)

# 3. Create the schema and seed sample data
npx prisma migrate dev --name init
npm run seed

# 4. Run
npm run dev   # http://localhost:3000  (admin at /admin)
```

## Environment variables

| Var                    | Purpose                                                      |
| ---------------------- | ----------------------------------------------------------- |
| `DATABASE_URL`         | Postgres connection string                                  |
| `ADMIN_PASSWORD`       | Password for the admin login                                |
| `SESSION_SECRET`       | Secret used to sign the admin session cookie (32+ chars)    |
| `ANTHROPIC_API_KEY`    | Anthropic API key for the AI research chat                  |
| `UPLOAD_DIR`           | Where uploaded images are stored (Railway: `/data/uploads`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (sitemap, Open Graph)                    |

## Deploying on Railway

1. Push this repo to GitHub (the setup script does this for you).
2. In Railway: **New Project → Deploy from GitHub repo**, and select this repo.
3. Add a **PostgreSQL** database plugin — Railway injects `DATABASE_URL` automatically.
4. Add a **Volume** and mount it at **`/data`** (this persists uploaded images across deploys).
5. Set service variables: `ADMIN_PASSWORD`, `SESSION_SECRET`, `ANTHROPIC_API_KEY`,
   `UPLOAD_DIR=/data/uploads`, `NEXT_PUBLIC_SITE_URL=https://austinbbqs.com`.
6. Deploy. The start command runs `prisma migrate deploy` before `next start`, so the schema is
   created/updated automatically on each deploy. (`railway.json` defines the build/start commands.)
7. Point the `austinbbqs.com` domain at the Railway service in **Settings → Networking**.

To seed the production database once, run `npm run seed` from a Railway shell (optional).

## Project layout

```
prisma/schema.prisma      data model
src/lib/                  db, auth, anthropic (Claude + tools), storage, hours, validation
src/middleware.ts         guards /admin and /api/admin
src/app/                  public pages, admin pages, API routes
src/components/           shared + admin UI
```
