# TF2 Trading Hub — 5.12.56 Guarded Publish Executor Self-Test

A safe, local-first TF2 trading cockpit for Home Assistant.
No automatic trade accepting. No automatic Steam Guard confirmation. No automatic Backpack.tf writes.

---

## Install / Update

1. Home Assistant → Settings → Add-ons → Add-on Store → menu (⋮) → Repositories
2. Add: `https://github.com/DenyTwo918/TF2-HA`
3. Find **TF2 Trading Hub** → Install (or Update to 5.12.56)
4. Start the add-on

---

## Setup Credentials

Open the add-on UI (Ingress) → Credentials section:
- Steam Web API Key + Steam ID64
- Backpack.tf Access Token (for price data and optional guarded publish)

---

## Run Local Workflow

Click **▶ Run Local Workflow**. Runs: provider sync → inventory sync → market scanner → planning queue → listing drafts → diagnostic triage.

---

## Approve Items

In the **Planning Queue** card: click **Approve** per item, or **Approve Top 3** for highest-scored candidates.

---

## Build Listing Drafts

Click **Build Drafts from Approved** in the **Listing Drafts** card.

---

## Enable Guarded Publish (optional)

In add-on options set `allow_guarded_backpack_publish: true`.

---

## Publish One Draft Manually

In Listing Drafts: approve a draft → click **Publish to Backpack.tf** → confirm the modal.
Only one draft is published per explicit click. No automatic publishing.

---

## Safety

| Feature | Status |
|---|---|
| Automatic Steam trade accepting | DISABLED |
| Automatic Steam Guard confirmation | DISABLED |
| Automatic Backpack.tf writes | DISABLED |
| Guarded manual publish | Opt-in, disabled by default |
| Scheduled/autopilot publishing | NEVER |

---

## CHANGELOG

### 5.12.56 — DONE Release
- One-click Local Workflow (provider + inventory + scanner + queue + drafts + triage)
- Release Check endpoint (verifies all safety flags and file structure)
- Final dashboard layout

### 5.12.35 — Guarded Backpack.tf Publish
- `allow_guarded_backpack_publish: false` option (disabled by default)
- Guarded publish with full safety gates + confirmation modal
- Audit events: attempted/succeeded/failed

### 5.12.34 — Planning Queue + Listing Drafts
- Persistent planning queue (`tf2-hub-planning-queue.json`)
- Persistent listing drafts (`tf2-hub-listing-drafts.json`)
- Approve/cancel/bulk-approve UI

### 5.12.33 — Clean Data Cleanup
- Removed legacy planning limit fields from all data files on startup migration
- `no_forbidden_fields_audit` diagnostic stage
- `/api/system/forbidden-fields-audit` endpoint


### 5.12.56 — Publish Verification & UI Cleanup

Adds one-draft manual Backpack.tf publish from approved local listing drafts. It is disabled by default, requires explicit confirmation, and never accepts Steam trades or triggers Steam confirmations.


## 5.12.56 – Publish Verification & UI Cleanup

This build combines the practical post-baseline patches: publish wizard, stronger Backpack.tf response parsing, duplicate listing guard, opportunity scoring, and dashboard polish. Guarded Backpack.tf publish remains disabled by default and still requires a manual click, one approved draft, and confirm=true. It never accepts Steam trades or confirms Steam actions.


## 5.12.56 – Publish verification and simple UI

Adds a Backpack.tf listing verification endpoint, automatic post-publish verification, a Verify listing button in Publish Wizard, and a simplified default UI that hides advanced/debug panels.


## 5.12.80 – Stock Visibility Dashboard

The maintainer can now auto-fill buy listing slots toward `target_active_buy_listings` while keeping a default stock cap of one item per SKU. Existing active buy listings, owned items, active sell listings and good incoming offers prevent another buy listing for the same item.


## 5.13.40 – Fast Dashboard Load & Faster Listing Fill

Adds a central Trading Brain status layer for buy/sell/counteroffer decisions, profit floors, SKU stock cap and balanced key+metal currency policy. This is the baseline for the 5.13 refactor line.


## 5.13.40 – Fast Dashboard Load & Faster Listing Fill

Trading Brain now receives a unified market-pricing summary from classifieds snapshots: highest buyer, lowest seller, spread, buyer/seller counts, expected profit and weak-market reasons. Buy drafts can use highest-buyer + bonus and sell drafts can use lowest-seller - undercut, while profit floors and stock cap remain enforced.

## 5.13.40 – Fast Dashboard Load & Faster Listing Fill

Manual maintainer runs now start in the background so Home Assistant ingress does not show a black screen / 502 while Backpack.tf calls are still running. Market Pricing Pipeline status is also wired into the production dashboard status object.


## 5.13.40 – Stock Count & Stack Sell Price Truth

The maintainer now skips buy drafts that are missing required keys/refined metal and immediately continues filling the next affordable listing. Missing currency is a skip reason, not a bot-stopping error.


## 5.13.40 – Affordable Candidate Rotation

The main dashboard suppresses impossible unaffordable buy samples, reports actionable candidates first, and keeps the maintainer moving past candidates that the account cannot fund yet.


## 5.13.40 – Cap-Fill Draft Prune & Actionable Rebuild

Unfundable/corrupt buy drafts are pruned before maintainer runs so the bot can continue filling affordable listings instead of staying stuck on one impossible candidate.


## 5.13.40 – Fallback Metrics & Stale Sell Listing Guard

Cap-fill no longer treats missing Backpack.tf snapshot data as a hard dead stop. In balanced mode, affordable buy drafts can use schema/planning values as a fallback when no snapshot is available, while crossed/corrupt markets and unaffordable buys stay blocked.



## 5.13.40 – Fallback Metrics & Stale Sell Listing Guard

Shows no-snapshot fallback fill as its own metric and flags stale sell listings that no longer match owned inventory.


## 5.13.40 – Crash Watchdog & Credential Vault Recovery

Maintainer prioritizes sell work before buy cap-fill: owned inventory sell detector runs first, sell draft backlog can defer new buy listings, and the dashboard shows Sell priority status. Existing safety gates remain unchanged: no Steam auto-accept, no Steam Guard auto-confirm, guarded Backpack.tf classifieds only.
## 5.13.40 – Main Account Canonical Vault Save

Credential saves are now verified by re-reading the canonical Main account vault. A last-good backup is written after successful saves, empty vault files can recover from legacy/options data, and the UI no longer clears token fields until verification succeeds.

## 5.13.40 – Live Dashboard Performance Pass

Inspired by lightweight pollers like TF2Autobot and Gladiator.tf, the dashboard now uses a fast lite-status path so opening the addon panel no longer pegs CPU/RAM or triggers the OOM-restart loop on small Home Assistant hosts. Safe-boot mode is no longer required to keep the UI responsive.

- New `/api/publish-wizard/status/lite` endpoint returns a few-KB summary (planning + draft counts, candidate, write mode, maintainer due timer, verification flag). The frontend polls lite by default and only fetches the full status when something actually changes or every 45 s as a safety net.
- The full status response is served from a 5 s in-memory cache (`PUBLISH_WIZARD_CACHE_TTL_MS` env var to override) and auto-invalidates whenever any input file the wizard reads gets rewritten.
- `redactDeep` is now bounded (depth 12, 200 keys, 200 array entries). The previous unbounded walker traversed the entire 1000-entry classifieds mirror on every poll.
- New `writeJsonIfChanged` helper hashes the serialized payload and skips the disk write when nothing changed; the publish wizard status no longer rewrites the same JSON to disk every 8 seconds.
- Frontend backs off to 60 s polling when the tab is hidden and applies exponential backoff (up to 2 min) on repeated errors. Focus/visibility events reset the backoff.
- `setLog` now caps the in-page `<pre>` payload at 64 KB so large diagnostic responses no longer balloon browser RAM. Use the diagnostic bundle download for full payloads.

## 5.13.40 – run.sh Hotfix

Re-publishes 5.13.40 with clean Home Assistant metadata files (`repository.yaml`, `config.yaml`, `build.yaml`, `run.sh`) and a fresh version bump so Supervisor can detect the update after repository cache issues.
