# Handoff – Northern Lights Photos (Book Lapland)

Paste this file (or its path) into Claude Code running on the desktop, in the local clone of `Karetuz12/Github`.
That session has what the cloud session lacked: Chrome (Claude in Chrome), local files and the user's logins.

Last updated: 4 Nov 2026. Branch: `claude/hopeful-bohr-f21rsr` (the repo has no `main`). Latest commit: `2ccaef5`.
The user writes in Finnish; answer in Finnish. Everything customer- and staff-facing must be in **English**.

---

## 1. What this is

Guides on northern lights tours used to ask customers for their email to send the tour photos. Now:

1. The guide shows a **QR card** (one per group).
2. The customer scans → `https://photos.booklapland.com/<group>` (e.g. `/7`, or `/S7` for Small Group 7),
   types their email, taps "Send me my photos".
3. The site (Next.js on Vercel) sends it to a **Google Apps Script web app**, which appends a row to a **Google Sheet**.
4. In the morning the **Morning** sheet lists last night's emails per group, ready to paste into **BCC**,
   and a **reminder email** goes to `photos@booklapland.fi` around 08:00 Finnish time.
5. Rows older than **30 days** are deleted nightly (promised to customers on the page).
6. Customers are promised their photos **within 48 hours**.

It is live and in daily use: on 4 Nov the sheet had ~385 sign-ups (e.g. 106 on the night of 1 Nov).

## 2. Where things are

| What | Where |
|---|---|
| Code | `revontulikuvat/` in this repo (Next.js 15, TypeScript, no DB). Docs: `revontulikuvat/GUIDE.md` |
| Live site | **https://photos.booklapland.com** (`.com`, NOT `.fi` – `.fi` does not exist) |
| Vercel | team **marketing-4208's projects**, project **revontulikuvat**, Root Directory `revontulikuvat`; `revontulikuvat/vercel.json` overrides the repo-root `vercel.json` (which builds `skyview-kartta`) |
| Vercel env vars | `APPS_SCRIPT_URL` (web app `/exec` URL), `APPS_SCRIPT_SECRET`, `SITE_URL`, optional `NEXT_PUBLIC_PRIVACY_URL` – already set (sign-ups work) |
| Google Sheet | "Book Lapland – Northern Lights Photos" https://docs.google.com/spreadsheets/d/1wwC0Ykvbx7cOzY26YZBTYLuRZSm2UqSE-48pexJZrLo/edit (shared drive, folder "Valokuvien lähetys") |
| Apps Script | bound to that sheet (Extensions → Apps Script). Source of truth: `revontulikuvat/apps-script/backend.gs`. Secret is in Script Properties – never print it into chat or files |
| Print files (Drive) | "Valokuvien lähetys → QR-koodit painoon" https://drive.google.com/drive/folders/1JNhnXscPdxwP_V3O7m984uUGC6HxTuFh |

### Site routes
- `/1`, `/2`… bus groups; `/S1`…`/S25` small groups (chip shows "Small Group 7"); `/` = customer types the group number
- `/cards` printable QR cards (bus 1–20 + general), `/cards?type=small` (Small Groups 1–25, violet frame + big SMALL GROUP band), `?from=&to=`, `?groups=A1,A2`
- `/guide` staff page: Bus Group / Small Group toggle, group number, guide name, camera number → Save (phone remembers name/camera; no PIN by the user's decision, `noindex`)
- `/api/signup`, `/api/guide` → Apps Script web app

### Sheet tabs (after the pending update)
- **Responses**: Time | Group | Email (bus groups stored as numbers, small groups as `S7`)
- **Guides**: Time | Group | Guide | Camera (camera as text)
- **Morning**: B1 = pick a date (empty = last night; accepts `31/10/2026` and `31.10.2026`, calendar on double-click), B2 = night shown.
  Rows: Group (S = Small Group) | Guide | Camera | Emails | Email addresses (BCC). Sign-ups until 06:00 count to the previous night. Sorted 1, 2, 10, S1, S2, S10.

### Apps Script functions
`setup` (fresh install only, refuses to run twice) · `addGuideColumns` (adds Guides sheet + Guide/Camera columns to an existing Morning sheet) · `fixDatePicker` · `scheduleMorningReminder` · `sendTestReminder` · `showSecret` · `deleteOldRows` (nightly trigger) · `doPost` (sign-ups + guide logs) · `doGet` (health check).
After changing `doPost`, the web app must be redeployed: **Deploy → Manage deployments → pencil on the EXISTING deployment → Version: New version → Deploy** (never a new deployment – the URL in Vercel must stay the same). Triggers (reminder, cleanup) use the latest saved code without redeploying.

## 3. Current state (checked 4 Nov 2026 from the sheet)

Done and working:
- Customer sign-ups → Responses → Morning (3-column layout), date cell B1 works.
- Code for everything below is pushed (commits `c4fe2e0`, `e97df9e`, `2ccaef5`).
- Drive folders created: `QR-koodit painoon/SMALL GROUP/` with `A4 julisteet` (id `1XFNdakFz-GCRpJUwdXRBElA8520hC602`), `Käyntikortit 85x55` (id `12kqXkkBFsGkDAu0WxrtZPVPOAf9zZulF`) and a Google Doc "LUE ENSIN – Small Group, tilausohje painotalolle".

**Not done yet (this is what we were doing):**
1. **Vercel production** may not have the latest commits. Earlier `revontulikuvat.vercel.app` showed `404 DEPLOYMENT_NOT_FOUND` because the production branch was `main`. The user tried `https://photos.booklapland.fi/guide` (wrong TLD). Unknown whether `https://photos.booklapland.com/guide` works.
2. **Apps Script not updated**: the sheet has no Guides tab and Morning still has the old 3 columns → the guide page's Save fails ("Could not save"). Unknown whether `fixDatePicker` / `scheduleMorningReminder` were ever run.
3. **Small Group print PDFs not in Drive** (the Drive connector could not upload 8.7 MB of PDFs). The folders exist and are empty.

## 4. Tasks, in order – verify each before moving on

1. **Vercel** (Chrome): project revontulikuvat → Settings → Environments → Production → Branch Tracking = `claude/hopeful-bohr-f21rsr` → Save (older UI: Settings → Git → Production Branch). Then Deployments → Create Deployment from that branch (or ⋯ → Redeploy on a deployment of the latest commit `2ccaef5`). Wait for Ready.
   Verify: `https://photos.booklapland.com/guide` shows "Tonight's tour" with Bus Group / Small Group; `https://photos.booklapland.com/S7` shows "Small Group 7"; `https://photos.booklapland.com/cards?type=small` shows violet Small Group cards.
2. **Apps Script** (Chrome): open the sheet → Extensions → Apps Script → replace ALL code with `revontulikuvat/apps-script/backend.gs` (git pull first) → save. Run one at a time, allowing permissions (new permissions: sending email as the user, and Drive access): `addGuideColumns`, `fixDatePicker`, `scheduleMorningReminder`, `importSmallGroupPrintFiles` (copies the 51 Small Group PDFs from GitHub into the Drive folders – see task 4). Then redeploy the EXISTING web app as a **New version** (see above).
3. **Test**: on `/guide` save Small Group 1, name "Test", camera 1 → "Saved". Check the Guides tab got the row and Morning has Group / Guide / Camera / Emails / Email addresses. Delete the test row. Optionally run `sendTestReminder` and check photos@booklapland.fi.
4. **Small Group PDFs to Drive**: easiest is the Apps Script function `importSmallGroupPrintFiles` (task 2) – it downloads the files from `revontulikuvat/print/small-group/` (public repo, raw.githubusercontent.com) into the two Drive folders and skips files already there. Check both folders afterwards (26 files in A4 julisteet, 25 in Käyntikortit 85x55). Fallback: `cd revontulikuvat && npm ci && node print/make-small-group-files.cjs "print/out/SMALL GROUP" 1 25` (needs Playwright + Chromium and the Inter font; the logo is `print/bl-logo.png`). Upload:
   - `print/out/SMALL GROUP/A4 julisteet/*` + `_KAIKKI-A4-small-group-toimistotulostus.pdf` → Drive `SMALL GROUP/A4 julisteet`
   - `print/out/SMALL GROUP/Käyntikortit 85x55/*` → Drive `SMALL GROUP/Käyntikortit 85x55`
   (Copying into the synced shared drive via Google Drive for desktop also works. The user also has `SMALL GROUP.zip` with the same files.)
   Before ordering prints: scan one code on screen with a phone and check it opens "Small Group N".

## 5. Print files – formats (match the existing bus files)

Existing bus files (made earlier on the desktop; their generator is not in the repo): `QR-koodit painoon/A4 bussijulisteet/BL-A4-bus-group-NN.pdf` and `Käyntikortit 85x55/BL-QR-group-NN.pdf`, dark navy with aurora glow, real BL logo, Inter, QR → `photos.booklapland.com/N`.
- A4 poster: 210 × 297 mm + 3 mm bleed → PDF 216 × 303 mm; office version without bleed in one PDF.
- Business card: 85 × 55 mm + 3 mm bleed → PDF 91 × 61 mm; one file per group.
- Small Group versions (`print/make-small-group-files.cjs`): same sizes, violet background, full-width "SMALL GROUP" band, big number, QR → `photos.booklapland.com/SN`. All 75 codes were machine-decoded and verified. No general card for small groups (a typed "7" would be stored as bus group 7).

## 6. Decisions and answers from the user / Marika

- Storage: Google Sheet (same pattern as the user's existing "working-hours-bl" app), no database.
- Everything in English (customer page has no language picker).
- Collected emails go to the sheet, not to the photos@ mailbox; photos@ only gets the morning reminder (counts + guide/camera per group, no addresses – keeps the 30-day deletion promise).
- Small Groups run on the same nights as bus groups → separate codes `S1…S25`.
- Cameras are numbers (camera field is numeric, 1–3 digits).
- Guide page: secret URL + noindex is enough, no PIN.
- Marika (later, no hurry): Small Group QR cards 1–25 and guide name + camera logging – both built.
- The user's Vercel team has Vercel Authentication on, so `*.vercel.app` asks for a Vercel login; customers use the custom domain.

## 7. Gotchas

- Domain is **photos.booklapland.com**. Some older docs/messages say `photos.booklapland.fi` – that was a guess and is wrong.
- The sheet locale is en_GB: dates typed day-first. `setFormula` in Apps Script uses English function names and commas.
- The cloud session could not create or see the Vercel project (403/404 from the Vercel connector) – do Vercel steps in the dashboard.
- `kuvalomake/` (an older Google Forms version, in Finnish) is unused.
- Local dev: `cd revontulikuvat && npm install && cp .env.example .env.local && npm run dev`; tests `npm test`.

## 8. Commit history (newest first)

```
2ccaef5 print files for Small Group QR codes (generator + logo)
e97df9e distinct Small Group cards (violet), numeric camera
c4fe2e0 Small Groups (/S1..), /guide page, Guides sheet, guide+camera on Morning and in the reminder
feb74f5 Morning date cell accepts 31.10.2026 and has a calendar (fixDatePicker)
3016812 morning reminder email to photos@booklapland.fi
965b75c setup() uses the existing Drive spreadsheet            (desktop session)
debdb3e promise photos within 48 hours                          (desktop session)
aa45b5b handoff notes
1ebff06 English only for customers and staff
039d5b4 own vercel.json in revontulikuvat/
871a6a6 first version of the site
cf5932f Google Forms version (kuvalomake/, unused)
```
