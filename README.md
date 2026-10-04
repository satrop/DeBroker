# Data Broker Opt-Out Tracker

A personal tool for tracking data-broker ("people-search") opt-out requests and whether they actually stick. Comes seeded with the top 20 brokers (name, opt-out link, submission method); mark which ones you're actually listed on, submit opt-outs, and the app tracks a 90-day recheck date automatically. An analytics view shows your overall and per-broker reappearance rate, so you can see which brokers are worth the continued effort.

## Running locally

```bash
npm install
npm run dev
```

## Persistence — read this

There is no backend. All data lives in this browser's `localStorage`, scoped to whichever device/browser you're using. That means:

- Nothing syncs automatically between your phone and laptop.
- Clearing site data / browser storage wipes your tracker.
- To move data between devices, use **Export JSON** on one device and **Import JSON** on the other (footer of the app).

If you later want real cross-device sync, the simplest upgrade path is a `data.json` file committed to this repo that you edit via GitHub's web UI or Claude Code — that's a step up in complexity worth deciding on deliberately rather than building by default.

## Data model

Each broker record: `id`, `name`, `optOutUrl`, `method` (`form` | `email` | `phone`), `notes`, `foundOnSearch`, `status` (`not_checked` | `not_found` | `submitted` | `confirmed_removed` | `reappeared`), `lastSubmittedDate`, `nextRecheckDate` (auto-set to `lastSubmittedDate + 90 days`), and a `history` log of events.

The seed list in `src/data/brokers.seed.json` has opt-out URLs as of when this was written — broker sites change their opt-out flows/URLs over time, so double-check a link if it stops working and update the entry's `notes`/`optOutUrl` as needed.

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the app and deploys it to GitHub Pages via GitHub's native Pages deployment (no extra token/package needed). In the repo's **Settings → Pages**, set the source to **GitHub Actions** once, and it'll deploy automatically afterward.

## Out of scope (by design)

No automated opt-out submission (brokers use CAPTCHAs/verification steps that block that), no push/email reminders (no backend to send them from — the in-app "due for recheck" banner is the reminder), no long-tail broker list beyond the top 20 + whatever you add manually, no multi-user/login, no real-time cross-device sync.
