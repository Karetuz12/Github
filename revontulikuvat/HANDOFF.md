# Handoff – Northern Lights Photos (for Claude Code on the desktop)

Paste this file (or its path) into a Claude Code session opened in the local clone of `Karetuz12/Github`.

## Goal

Get `revontulikuvat/` live on Vercel so customers on northern lights tours can scan a QR card and leave their
email for the tour photos. Everything customer- and staff-facing is in English. Full details: `revontulikuvat/GUIDE.md`.

## State (21 Oct 2026)

- Code is complete and pushed to branch `claude/hopeful-bohr-f21rsr` (latest commit `1ebff06`). The repo has no `main` branch.
- Build, unit tests and an end-to-end test against a local mock of the Apps Script backend all pass.
- Vercel project **revontulikuvat** exists in team **marketing-4208's projects**, linked to this repo with
  Root Directory `revontulikuvat`. `revontulikuvat/vercel.json` overrides the repo-root `vercel.json` (which builds `skyview-kartta`).
- `https://revontulikuvat.vercel.app` shows `404 DEPLOYMENT_NOT_FOUND`: the project's production branch is still the
  default `main`, so deployments from `claude/hopeful-bohr-f21rsr` are previews only.
- The cloud session could not create, see or change the Vercel project (403/404), so these steps need local credentials.

## Tasks

1. `git fetch origin && git checkout claude/hopeful-bohr-f21rsr && git pull`
2. `cd revontulikuvat && npm ci && npm test && npm run build` – should all pass.
3. Set the Vercel production branch of project `revontulikuvat` to `claude/hopeful-bohr-f21rsr`
   (dashboard: Settings → Environments → Production → Branch Tracking, or the Vercel API/CLI).
   Then promote the latest Ready deployment to production, or run `npx vercel deploy --prod` from the repo root after
   `npx vercel link --scope marketing-4208s-projects --project revontulikuvat`.
4. Verify `https://revontulikuvat.vercel.app/7` and `/cards` load (while logged in to Vercel – team Vercel Authentication
   blocks anonymous visitors on `*.vercel.app`).
5. Google backend – needs the user at the keyboard (Google login): follow GUIDE.md step 1 (script.new → paste
   `apps-script/backend.gs` → run `setup` → Deploy as Web app, Execute as Me, Access Anyone). Then add env vars to the
   Vercel project for Production and Preview: `APPS_SCRIPT_URL`, `APPS_SCRIPT_SECRET` (e.g. `npx vercel env add`), and redeploy.
6. Custom domain: add `photos.booklapland.fi` (or what the user picks) in Vercel → Domains, help the user with the DNS
   record, set `SITE_URL=https://photos.booklapland.fi`, redeploy. Customers can only reach the site on a custom domain.
7. End-to-end check: submit a real email on `/7`, confirm the row appears on the **Responses** sheet and on **Morning**
   the next day (or by typing today's date into Morning!B1).

## Open items from the user

- Brand: real Book Lapland logo and colours not yet received. Logo goes to `public/logo.svg` + `lib/brand.ts`, colours in
  `app/globals.css` `:root`.
- Proposed next feature (not started): password-protected staff dashboard `/staff` – pick a night, groups with
  "Copy emails", "Open email" (BCC prefilled) and CSV download, reading from the same Google Sheet.
