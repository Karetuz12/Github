# Northern Lights Photos – collecting emails with a QR code

On a northern lights tour, the customer scans the guide's QR card and lands on a Book Lapland page.
The group number is already filled in, so the customer only types their email address.
Emails are saved to Google Sheets. In the morning, the **Morning** sheet lists last night's emails by group,
ready to paste into the BCC field.

```
Customer's phone ──► photos.booklapland.fi/7 (Next.js on Vercel) ──► Google Apps Script ──► Google Sheets
                                                                                               ├─ Responses (all rows)
Guide's QR card ◄── photos.booklapland.fi/cards (printable A4)                                 └─ Morning (last night by group)
```

## What's on the site

- **Customer page** `/7`, `/12` etc. The number comes from the QR card. On the plain address `/`
  the customer types the group number.
  - Dark northern lights look. Dark on purpose, so a bright screen doesn't ruin everyone's night vision on the tour.
  - Typo check: `anna@gmial.com` → "Did you mean anna@gmail.com?"
  - Confirmation screen with "Add another email" (for family members).
  - Privacy note: the email is deleted within 30 days, which the nightly clean-up takes care of.
- **QR cards** `/cards`: groups 1–20 plus a general card, four per A4 page, with a Print button.
  - Other groups: `/cards?from=21&to=40`, or named groups `/cards?groups=A1,A2,B1`.
- **Spam protection**: a hidden field that only bots fill in. The Google Sheet only accepts writes with the secret.

## Setup (once, about 20 minutes)

### 1. Google Sheets and Apps Script (marketing@booklapland.fi)

1. Open **https://script.new** and name the project, e.g. "Northern Lights Photos".
2. Replace the existing code in the editor with all of `apps-script/backend.gs` and save (Ctrl+S).
3. Select **setup** in the function menu and click **Run**. Allow the permissions. If you see "Google hasn't verified
   this app", click **Advanced → Go to Northern Lights Photos (unsafe) → Allow**. The warning appears because the script
   is your own and not reviewed by Google.
4. The log shows the spreadsheet link and the **APPS_SCRIPT_SECRET**. Copy the secret.
   If you lose it, run the function `showSecret`.
5. Click **Deploy → New deployment** (top right).
   - Type (gear icon): **Web app**
   - Execute as: **Me** (marketing@booklapland.fi)
   - Who has access: **Anyone**
   - Click **Deploy** and copy the **Web app URL** (ends with `/exec`).

   "Anyone" is needed because Vercel sends the sign-ups without a Google login. Without the secret nobody can
   write to the sheet, and the address cannot be used to read anything.

### 2. Vercel (project `revontulikuvat`, already created)

1. **Settings → Environment Variables**:
   | Name | Value |
   |---|---|
   | `APPS_SCRIPT_URL` | the URL from step 1.5 (`…/exec`) |
   | `APPS_SCRIPT_SECRET` | the secret from step 1.4 |
   | `SITE_URL` | the final address of the site, e.g. `https://photos.booklapland.fi` (used in the QR cards) |
   | `NEXT_PUBLIC_PRIVACY_URL` | privacy policy address (optional, shown at the bottom of the page) |
2. **Settings → Environments → Production → Branch Tracking** = `claude/hopeful-bohr-f21rsr`
   (the repo has no `main` branch).
3. **Deployments** → newest → **⋯ → Redeploy**. Environment variables only take effect after a redeploy.

### 3. Your own address (important)

Your Vercel team has **Vercel Authentication** turned on. It asks for a Vercel login on `*.vercel.app`
addresses, and customers can't get past it. A custom domain skips that protection and looks more official too:

1. Vercel project → Settings → **Domains** → add e.g. `photos.booklapland.fi`.
2. Add the DNS record Vercel shows to the domain's DNS settings (usually CNAME `photos` → `cname.vercel-dns.com`).
3. Set `SITE_URL` = `https://photos.booklapland.fi` and redeploy.

### 4. Test before the first tour

1. Open `https://photos.booklapland.fi/7` on a phone, enter your own email and send.
2. Check that a row appeared on the **Responses** sheet.
3. Open `https://photos.booklapland.fi/cards`, print, cut and laminate the cards.
4. Scan one printed card and check that the page opens with the right group number.

## In the morning

1. Open the spreadsheet → **Morning**. It shows last night's tours.
   - Sign-ups until 06:00 count towards the previous night, so tours that run past midnight stay together.
   - To see another night, type a date in the yellow cell **B1**. Clear the cell to go back to last night.
2. Copy a group's email addresses into the **BCC** field and send the link to the group's photos.
   Use BCC so customers don't see each other's addresses.

Share the spreadsheet with the colleagues who send the photos (Share button).

## Making changes

| What | Where |
|---|---|
| Brand colours | `app/globals.css`, the `:root` block at the top (`--bl-brand` = button green etc.) |
| Logo | Add `public/logo.svg` (or .png) and set `lib/brand.ts` → `logo: '/logo.svg'`. Until then a text logo "BOOK LAPLAND" is shown. |
| Page texts | `lib/strings.ts` |
| Retention period | `lib/brand.ts` (`retentionDays`, shown to customers) **and** `apps-script/backend.gs` (`retentionDays`, the actual clean-up) |
| QR card design | `app/cards/page.tsx` and `app/cards/cards.css` |

Changes to the site go live when they are pushed to the repo; Vercel deploys them automatically.
If `backend.gs` changes, paste the new version into the Apps Script editor and choose **Deploy → Manage deployments →
edit (pencil) → Version: New version → Deploy**. The URL stays the same.

## Local development

```bash
cd revontulikuvat
npm install
cp .env.example .env.local   # fill in APPS_SCRIPT_URL and APPS_SCRIPT_SECRET
npm run dev                  # http://localhost:3000/7
npm test                     # tests for email and group validation
```

## Notes

- The `kuvalomake/` folder contains an earlier Google Forms version. It is not needed when this site is in use.
- Sending the photos could be automated later: in the morning you paste the group's photo link and the site sends
  each customer their own Book Lapland email. No more BCC copying.
