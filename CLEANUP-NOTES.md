# Cleanup Notes — Vercel Serverless Deployment Optimization

**Date:** 2026-03-05
**Purpose:** Identify files/directories that are NOT needed for production Vercel deployment and can be safely excluded.

---

## Summary

The project uses **Supabase** as its database. Several directories and files are leftovers from earlier development (Prisma/SQLite), dev-only tooling, or agent context files. None of these are imported or referenced by the `src/` application code.

---

## Directory-by-Directory Analysis

### 1. `scripts/` (208K)
- **Contents:** `reset-database.ts`, `simulateSeason.ts`, `simulateTwoSeasons.ts`, `simulate-10-seasons.ts`, `simulate-4-seasons.py`, `load-test.js`, `fix-positions.ts`, `seedBots.ts`, `migrate-local-users-to-auth.ts`, `test-home-advantage.ts`, `archive/`
- **References in src/:** NONE
- **package.json:** `reset-db` script references `scripts/reset-database.ts`
- **Verdict:** DEV-ONLY. These are utility/maintenance scripts. They won't be included in Vercel build anyway (not in `src/`), but should stay in repo for developer use.
- **Action:** Keep in repo. No .gitignore change needed (already excluded from Next.js build).

### 2. `.zscripts/` (40K)
- **Contents:** `start.sh`, `dev.sh`, `build.sh`, `mini-services-build.sh`, `mini-services-start.sh`, `mini-services-install.sh`, `next-dev.log`, `dev.pid`
- **References in src/:** NONE
- **Verdict:** DEV-ONLY. Shell scripts for local development automation. Contains log/PID files that should never be committed.
- **Action:** Add to `.gitignore`.

### 3. `examples/` (20K)
- **Contents:** `websocket/server.ts`, `websocket/frontend.tsx` — Socket.IO example code
- **References in src/:** NONE
- **Verdict:** DEV-ONLY. Reference/example code not used in production.
- **Action:** Add to `.gitignore`.

### 4. `mini-services/` (empty directory)
- **Contents:** Empty directory (exists but no files)
- **References in src/:** NONE (referenced only by `.zscripts/` build scripts)
- **Verdict:** DEV-ONLY. No actual services exist. Directory is a placeholder.
- **Action:** Add to `.gitignore`.

### 5. `prisma/` (8K) ⚠️ LEGACY
- **Contents:** `schema.prisma` — Basic SQLite schema with User/Post models (scaffolded template)
- **References in src/:** NONE (no imports of prisma schema)
- **Notes:** The project uses Supabase, NOT Prisma. The `prisma/schema.prisma` defines a SQLite datasource which is completely unrelated to the Supabase PostgreSQL setup.
- **Related dead code:** `src/lib/db.ts` imports `@prisma/client` but:
  - `@prisma/client` is NOT in `package.json` dependencies
  - No other file imports from `src/lib/db.ts`
  - This file is **dead code** and would fail at build time if ever imported
- **Verdict:** LEGACY / SAFE TO REMOVE. Not used in production.
- **Action:** Add to `.gitignore`. Also recommend deleting `src/lib/db.ts` (dead Prisma import).

### 6. `python/` (200K)
- **Contents:** `award_season.py`, `bot_actions.py`, `cron_youth_academy.py`, `season_end_trigger.py`, `regen_system.py`, `update_player_values.py`, `requirements.txt`
- **References in src/:** NONE
- **Verdict:** DEV-ONLY. These are Python reference implementations of cron jobs that have been ported to TypeScript API routes (`src/app/api/cron/`). Not used in Next.js build.
- **Action:** Add to `.gitignore`.

### 7. `db/` (28K) ⚠️ LEGACY
- **Contents:** `custom.db` — 24KB SQLite database file
- **References in src/:** NONE
- **Notes:** `.env` contains `DATABASE_URL=file:/home/z/my-project/db/custom.db` pointing to this SQLite file. This is the OLD Prisma/SQLite setup, completely superseded by Supabase.
- **Verdict:** LEGACY / SAFE TO REMOVE. Binary database file should never be in a Vercel deployment.
- **Action:** Add to `.gitignore`. Recommend also updating `.env` to remove the old `DATABASE_URL=file:...` entry.

### 8. `upload/` (536K)
- **Contents:** `pasted_image_1779834105978.png` — Single pasted image file
- **References in src/:** NONE
- **Verdict:** DEV-ONLY. Likely a screenshot pasted during development. Not referenced in code.
- **Action:** Add to `.gitignore`.

### 9. `agent-ctx/` (56K)
- **Contents:** 12 markdown files with agent instructions/context (e.g., `guvenlik-2-4-agent.md`, `7-11-implementation.md`, etc.)
- **References in src/:** NONE
- **Verdict:** DEV-ONLY. Agent context files for development workflow. Not part of the application.
- **Action:** Add to `.gitignore`.

---

## Dead Code in src/

### `src/lib/db.ts`
- Imports `@prisma/client` which is NOT in dependencies
- Not imported by any other file in the project
- **Recommendation:** Delete this file. It's leftover from a Prisma setup that was replaced by Supabase.

---

## .env Cleanup Note

The `.env` file contains:
```
DATABASE_URL=file:/home/z/my-project/db/custom.db
```
This points to the old SQLite database and is NOT used by the Supabase-based application. The admin API routes that reference `DATABASE_URL` expect a PostgreSQL connection string (Supabase), not a SQLite file path. This should be updated to the Supabase connection string or removed.

---

## Total Size Impact

| Directory | Size | Production Needed? |
|-----------|------|-------------------|
| scripts/ | 208K | No (dev scripts) |
| .zscripts/ | 40K | No |
| examples/ | 20K | No |
| mini-services/ | 0K | No |
| prisma/ | 8K | No (legacy) |
| python/ | 200K | No |
| db/ | 28K | No (legacy SQLite) |
| upload/ | 536K | No |
| agent-ctx/ | 56K | No |
| **Total** | **~1.1MB** | **None needed in prod** |

While 1.1MB is small, the real benefit is reducing build complexity, avoiding confusion from legacy files, and ensuring Vercel doesn't attempt to process unnecessary files.

---

## Next.js Build Note

Next.js only bundles files under `src/`, `app/`, `pages/`, and `public/`. The directories listed above are already excluded from the build output automatically. However, adding them to `.gitignore` ensures:
1. They don't get deployed to Vercel's build environment (faster git pushes)
2. No binary files (like `custom.db` or images) accidentally get included
3. Clean `git status` during development
