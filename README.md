# Data Broker Opt-Out Tracker

A personal tool for tracking data-broker ("people-search") opt-out requests and whether they actually stick. Comes seeded with the top 20 brokers (name, opt-out link, submission method); mark which ones you're actually listed on, submit opt-outs, and the app tracks a 90-day recheck date automatically. An analytics view shows your overall and per-broker reappearance rate, so you can see which brokers are worth the continued effort.

## Running locally

```bash
npm install
npm run dev
```

## Persistence

Data is backed by [Supabase](https://supabase.com) (hosted Postgres + REST API) when configured, with `localStorage` as a local cache and offline fallback. Without Supabase configured, the app runs in local-only mode (same behavior as before — nothing syncs, clearing site data wipes your tracker).

### Setting up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql) once — it creates the `brokers` table with row-level security so each signed-in user only ever sees their own rows.
3. In **Settings → API**, copy the **Project URL** and the **anon public key** (this key is safe to expose in client code by design — Supabase's security model is enforced by the row-level security policy, not by keeping the key secret).
4. Locally: copy `.env.example` to `.env` and fill in both values.
5. In the GitHub repo's **Settings → Secrets and variables → Actions**, add two repository secrets: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (same values) — the deploy workflow bakes them into the production build.
6. Open the app, sign up with an email/password (just for yourself), and your current browser data is pushed to the cloud automatically on first sign-in. From then on, every change syncs to Supabase and is also cached locally.

Since this is a single-user tool, consider turning off public sign-ups once your own account exists (**Authentication → Providers → Email**, or **Authentication → Settings**) — not required for data safety (row-level security already isolates every user's rows), just to keep the project tidy.

Export/Import JSON (footer of the app) still works as a manual backup regardless of whether Supabase is configured.

## Data model

Each broker record: `id`, `name`, `optOutUrl`, `method` (`form` | `email` | `phone`), `notes`, `foundOnSearch`, `status` (`not_checked` | `not_found` | `submitted` | `confirmed_removed` | `reappeared`), `lastSubmittedDate`, `nextRecheckDate` (auto-set to `lastSubmittedDate + 90 days`), and a `history` log of events.

The seed list in `src/data/brokers.seed.json` has opt-out URLs as of when this was written — broker sites change their opt-out flows/URLs over time, so double-check a link if it stops working and update the entry's `notes`/`optOutUrl` as needed.

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the app and deploys it to GitHub Pages via GitHub's native Pages deployment (no extra token/package needed). In the repo's **Settings → Pages**, set the source to **GitHub Actions** once, and it'll deploy automatically afterward.

## Out of scope (by design)

No automated opt-out submission (brokers use CAPTCHAs/verification steps that block that), no push/email reminders (the in-app "due for recheck" banner is the reminder), no long-tail broker list beyond the top 20 + whatever you add manually, no multi-user support beyond "whoever can sign into your Supabase project," no realtime live sync across simultaneously-open tabs/devices (each syncs on its own actions and on sign-in, not via a live subscription).
