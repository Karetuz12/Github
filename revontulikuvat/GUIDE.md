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
- **QR cards** `/cards`: Bus Groups 1–20 plus a general card, four per A4 page, with a Print button.
  - **Small Groups 1–25**: `/cards?type=small`. Their cards say "SMALL GROUP 7" and point to `/S7`.
  - Other ranges: `/cards?from=21&to=40`, `/cards?type=small&from=26&to=30`, or named groups `/cards?groups=A1,A2`.
- **Guide page** `/guide`: before the tour the guide picks **Bus Group / Small Group**, types the **group number**,
  **their name** and **camera**, and taps Save. The phone remembers the name and camera for next time. Share the
  address with the guides only (e.g. save it to their home screen); it is not linked from the customer pages.
- **Spam protection**: a hidden field that only bots fill in. The Google Sheet only accepts writes with the secret.

## Setup (once, about 20 minutes)

### 1. Google Sheets and Apps Script (marketing@booklapland.fi)

1. Open the spreadsheet **Book Lapland – Northern Lights Photos** in the Drive folder "Valokuvien lähetys"
   and choose **Extensions → Apps Script**. Name the project, e.g. "Northern Lights Photos".
   (Without a spreadsheet you can also start from **https://script.new**; `setup` then creates one in My Drive.)
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
   - To see another night, type a date in the yellow cell **B1**, day first: `31/10/2026` or `31.10.2026`
     (or double-click B1 for a calendar). Clear the cell to go back to last night.
   - Spreadsheets set up before 2 Nov 2026: run **fixDatePicker** once in Extensions → Apps Script
     (after pasting the latest `backend.gs`) so B1 also accepts dates typed with dots and gets the calendar.
2. Copy a group's email addresses into the **BCC** field and send the link to the group's photos.
   Use BCC so customers don't see each other's addresses.

Share the spreadsheet with the colleagues who send the photos (Share button).

## Guides, cameras and Small Groups in the spreadsheet

- **Guides** sheet: every save on the guide page (time, group, guide, camera).
- **Morning** sheet columns: **Group** (bus groups as `7`, Small Groups as `S7`) · **Guide** · **Camera** ·
  **Emails** · **Email addresses**. Guide and camera come from the Guides sheet for the same night and group.
  If two guides logged the same group, both are shown.
- The morning reminder email lists the same per group, e.g. "Small Group 2 – Anna – camera 7 – 8 emails".

**Turning this on in the spreadsheet that is already in use** (new installs get it from `setup`):

1. Spreadsheet → **Extensions → Apps Script** → replace all the code with the latest `apps-script/backend.gs` → save.
2. Run **addGuideColumns** once. It adds the Guides sheet and the Guide and Camera columns to Morning.
3. Run **importSmallGroupPrintFiles** once. It copies the Small Group print PDFs (`print/small-group/` in this repo)
   into Drive: QR-koodit painoon → SMALL GROUP → A4 julisteet / Käyntikortit 85x55.
4. **Deploy → Manage deployments → edit (pencil) → Version: New version → Deploy.** This one is needed this time,
   because the web app now also receives the guide page's saves. The URL stays the same.

## Morning reminder email

Every morning around **08:00** (Finnish time) **photos@booklapland.fi** gets an email:
"Northern lights photos to send – 12 emails from Thu 29 Oct", with the number of emails per group and a button
that opens the Morning sheet. Nights without sign-ups send nothing.

The email only contains counts, not the customers' addresses. The addresses stay in the spreadsheet, where they are
deleted after 30 days as promised to the customers.

**Turning it on in the spreadsheet that is already in use** (new installs get it from `setup` automatically):

1. Open the spreadsheet → **Extensions → Apps Script**.
2. Replace all the code with the latest `apps-script/backend.gs` and save (Ctrl+S).
3. Select **scheduleMorningReminder** in the function menu and click **Run**. Google asks for one new permission
   (sending email as you) – allow it.
4. To see what the email looks like, run **sendTestReminder**. It sends one right away.

The web app deployment does not need to be updated for this.

Settings at the top of `backend.gs`: `reminderTo` (several addresses: `'a@booklapland.fi, b@booklapland.fi'`),
`reminderHour`, and `reminderWhenEmpty: true` to get an email also after nights without sign-ups.
After changing them, run **scheduleMorningReminder** again.

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
