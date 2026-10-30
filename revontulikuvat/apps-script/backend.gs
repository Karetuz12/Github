/**
 * Book Lapland – Northern lights photos: Google Sheets backend
 *
 * The website (Vercel) sends every sign-up here. The script stores it on the
 * Responses sheet, and the Morning sheet lists last night's emails by group.
 * Every morning a reminder email links to the Morning sheet, and rows older
 * than 30 days are deleted every night.
 *
 * Setup: see revontulikuvat/GUIDE.md.
 */

const SETTINGS = {
  retentionDays: 30,      // emails are deleted automatically after this
  dayStartsAtHour: 6,     // sign-ups until 06:00 belong to the previous night's tour
  morningRows: 50,        // how many groups the Morning sheet can show for one day
  spreadsheetName: 'Book Lapland – Northern Lights Photos',
  reminderTo: 'photos@booklapland.fi', // morning reminder goes here (several: 'a@x.fi, b@x.fi')
  reminderHour: 8,        // sent between 08:00 and 09:00 Finnish time
  reminderWhenEmpty: false, // false = no email on nights without sign-ups
  timeZone: 'Europe/Helsinki',
};

/**
 * Sets up the Morning summary, the Responses sheet and the nightly clean-up. Run once.
 * Opened from a spreadsheet (Extensions → Apps Script) it uses that spreadsheet,
 * otherwise it creates a new one in My Drive.
 */
function setup() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('SHEET_ID')) {
    throw new Error('Already set up: ' + SpreadsheetApp.openById(props.getProperty('SHEET_ID')).getUrl());
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create(SETTINGS.spreadsheetName);
  spreadsheet.setSpreadsheetTimeZone('Europe/Helsinki');
  spreadsheet.setSpreadsheetLocale('en_GB');

  const morning = spreadsheet.getSheets()[0].setName('Morning');
  const responses = spreadsheet.getSheetByName('Responses') || spreadsheet.insertSheet('Responses');
  responses.getRange('A1:C1').setValues([['Time', 'Group', 'Email']]).setFontWeight('bold');
  responses.setFrozenRows(1);
  responses.getRange('A2:A').setNumberFormat('ddd d mmm yyyy HH:mm');
  responses.setColumnWidth(1, 170);
  responses.setColumnWidth(3, 280);

  buildMorningSheet(spreadsheet);
  spreadsheet.setActiveSheet(morning);

  const secret = Utilities.getUuid().replace(/-/g, '');
  props.setProperties({ SHEET_ID: spreadsheet.getId(), SECRET: secret });
  scheduleCleanup();
  scheduleMorningReminder();

  Logger.log('Done!\n\nSpreadsheet: ' + spreadsheet.getUrl() +
    '\n\nAPPS_SCRIPT_SECRET (copy this to Vercel):\n' + secret +
    '\n\nNext: Deploy → New deployment → Web app (see GUIDE.md).');
}

/** Shows the secret again if it got lost. */
function showSecret() {
  Logger.log(PropertiesService.getScriptProperties().getProperty('SECRET'));
}

/** Sign-ups from the website arrive here. */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const props = PropertiesService.getScriptProperties();
    if (!data || data.secret !== props.getProperty('SECRET')) return reply({ ok: false, error: 'forbidden' });

    const email = String(data.email || '').trim().toLowerCase();
    const group = String(data.group || '').trim().toUpperCase();
    // Same checks as the website; a leading = + - would be read as a formula
    if (!/^[a-z0-9._%+'-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(email) || /^[=+\-]/.test(email)) {
      return reply({ ok: false, error: 'email' });
    }
    if (!/^[A-Z0-9][A-Z0-9-]{0,9}$/.test(group)) return reply({ ok: false, error: 'group' });

    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      const responses = SpreadsheetApp.openById(props.getProperty('SHEET_ID')).getSheetByName('Responses');
      // Numeric groups as numbers, so the Morning sheet sorts 2 before 10
      responses.appendRow([new Date(), /^\d+$/.test(group) ? Number(group) : group, email]);
    } finally {
      lock.releaseLock();
    }
    return reply({ ok: true });
  } catch (err) {
    console.error(err);
    return reply({ ok: false, error: 'server' });
  }
}

/** Opened in a browser, shows that the service is running. */
function doGet() {
  return reply({ ok: true, service: 'northern-lights-photos' });
}

/** Deletes rows older than retentionDays. Runs every night. */
function deleteOldRows() {
  const cutoff = new Date(Date.now() - SETTINGS.retentionDays * 24 * 3600 * 1000);
  const isOld = (value) => value instanceof Date && value < cutoff;

  const responses = SpreadsheetApp
    .openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'))
    .getSheetByName('Responses');
  const lastRow = responses.getLastRow();
  if (lastRow < 2) return;
  // Always keep an empty row, because a sheet cannot lose all its rows
  if (responses.getMaxRows() === lastRow) responses.insertRowAfter(lastRow);

  const times = responses.getRange(2, 1, lastRow - 1, 1).getValues();
  // Delete from the bottom up, in contiguous blocks
  let i = times.length - 1;
  while (i >= 0) {
    if (!isOld(times[i][0])) {
      i--;
      continue;
    }
    let start = i;
    while (start > 0 && isOld(times[start - 1][0])) start--;
    responses.deleteRows(start + 2, i - start + 1);
    i = start - 1;
  }
}

function scheduleCleanup() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'deleteOldRows')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('deleteOldRows').timeBased().everyDays(1).atHour(4).inTimezone(SETTINGS.timeZone).create();
}

/**
 * Turns on the morning reminder email. Already done by setup; run this once
 * if the script was set up before the reminder existed. Safe to run again.
 */
function scheduleMorningReminder() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'sendMorningReminder')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendMorningReminder')
    .timeBased().everyDays(1).atHour(SETTINGS.reminderHour).inTimezone(SETTINGS.timeZone).create();
  Logger.log('Morning reminder is on: every day around ' + SETTINGS.reminderHour + ':00 to ' + SETTINGS.reminderTo);
}

/** Sends the reminder right now, even if there were no sign-ups. For testing. */
function sendTestReminder() {
  sendReminder(true);
}

/** Runs every morning: tells the photo team how many emails last night's tours collected. */
function sendMorningReminder() {
  sendReminder(SETTINGS.reminderWhenEmpty);
}

function sendReminder(sendWhenEmpty) {
  const spreadsheet = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
  const responses = spreadsheet.getSheetByName('Responses');
  const morning = spreadsheet.getSheetByName('Morning');
  const tz = SETTINGS.timeZone;
  const shift = SETTINGS.dayStartsAtHour * 3600 * 1000;
  const lastNight = Utilities.formatDate(new Date(Date.now() - 24 * 3600 * 1000), tz, 'yyyy-MM-dd');

  // Same rule as the Morning sheet: sign-ups before 06:00 belong to the previous night
  const groups = {};
  const lastRow = responses.getLastRow();
  const rows = lastRow < 2 ? [] : responses.getRange(2, 1, lastRow - 1, 3).getValues();
  rows.forEach(([time, group, email]) => {
    if (!(time instanceof Date) || !email) return;
    if (Utilities.formatDate(new Date(time.getTime() - shift), tz, 'yyyy-MM-dd') !== lastNight) return;
    const key = String(group);
    groups[key] = groups[key] || {};
    groups[key][String(email).trim().toLowerCase()] = true;
  });
  const list = Object.keys(groups)
    .sort((a, b) => (isNaN(a) || isNaN(b) ? a.localeCompare(b) : Number(a) - Number(b)))
    .map((group) => ({ group, count: Object.keys(groups[group]).length }));
  const total = list.reduce((sum, g) => sum + g.count, 0);
  if (!total && !sendWhenEmpty) return;

  const nightText = Utilities.formatDate(new Date(Date.now() - 24 * 3600 * 1000), tz, 'EEE d MMM');
  const link = spreadsheet.getUrl() + '#gid=' + morning.getSheetId();
  const subject = total
    ? `Northern lights photos to send – ${total} email${total === 1 ? '' : 's'} from ${nightText}`
    : `Northern lights photos – no sign-ups on ${nightText}`;

  const rowsHtml = list.map((g) =>
    `<tr><td style="padding:6px 16px 6px 0">Group ${escapeHtml(g.group)}</td>` +
    `<td style="padding:6px 0;text-align:right">${g.count} email${g.count === 1 ? '' : 's'}</td></tr>`).join('');
  const htmlBody = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#17293f;max-width:560px">
  <p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#0b7a54"><b>Book Lapland · Northern lights photos</b></p>
  <h2 style="margin:0 0 12px;font-size:22px">${total
      ? `Good morning! Last night's tours collected ${total} email${total === 1 ? '' : 's'}.`
      : 'Good morning! No sign-ups last night.'}</h2>
  ${total ? `<table style="border-collapse:collapse;margin:0 0 18px">${rowsHtml}</table>` : ''}
  <p style="margin:0 0 20px"><a href="${link}" style="display:inline-block;background:#0b7a54;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:bold">Open the Morning sheet</a></p>
  <p style="margin:0 0 6px"><b>How to send the photos</b></p>
  <ol style="margin:0 0 18px;padding-left:20px">
    <li>Open the Morning sheet – it shows last night's tours automatically.</li>
    <li>Copy a group's email addresses into the <b>BCC</b> field of a new email.</li>
    <li>Add the link to that group's photos and send. Then the next group.</li>
  </ol>
  <p style="margin:0;font-size:12px;color:#5d7189">Tour night: ${nightText}. Sign-ups until 06:00 count towards the previous night.
  Customers were promised their photos within 48 hours.</p>
</div>`;
  const body = (total
      ? `Last night's tours (${nightText}) collected ${total} email(s):\n` +
        list.map((g) => `- Group ${g.group}: ${g.count}`).join('\n')
      : `No sign-ups on ${nightText}.`) +
    `\n\nOpen the Morning sheet: ${link}\n\n` +
    'Copy each group\'s email addresses into the BCC field and send the link to the group\'s photos.';

  MailApp.sendEmail({ to: SETTINGS.reminderTo, subject, body, htmlBody, name: 'Book Lapland Photos' });
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

function buildMorningSheet(spreadsheet) {
  const s = spreadsheet.getSheetByName('Morning');
  const time = 'Responses!$A$2:$A';
  const group = 'Responses!$B$2:$B';
  const email = 'Responses!$C$2:$C';
  const onDay = `${time}<>"",INT(${time}-${SETTINGS.dayStartsAtHour}/24)=$B$2`;

  s.getRange('A1:A3').setValues([
    ['Pick a date (empty = last night):'],
    ['Showing tour night of:'],
    [''],
  ]);
  s.getRange('B1:B2').setNumberFormat('ddd d mmm yyyy');
  s.getRange('B1').setBackground('#fff8c5');
  s.getRange('B2').setFormula('=IF(B1="",TODAY()-1,B1)').setFontWeight('bold');
  s.getRange('A3').setFormula(
    `="Emails in total: "&IFERROR(ROWS(FILTER(${email},${onDay})),0)`);

  s.getRange('A5:C5')
    .setValues([['Group', 'Emails', 'Email addresses – paste into the BCC field']])
    .setFontWeight('bold')
    .setBackground('#e8eef7');
  s.getRange('A6').setFormula(`=IFERROR(SORT(UNIQUE(FILTER(${group},${onDay}))),"")`);

  const formulas = [];
  for (let r = 6; r < 6 + SETTINGS.morningRows; r++) {
    const addresses = `UNIQUE(LOWER(TRIM(FILTER(${email},${onDay},${group}=$A${r}))))`;
    formulas.push([
      `=IF($A${r}="","",ARRAYFORMULA(COUNTA(${addresses})))`,
      `=IF($A${r}="","",ARRAYFORMULA(TEXTJOIN(", ",TRUE,${addresses})))`,
    ]);
  }
  s.getRange(6, 2, SETTINGS.morningRows, 2).setFormulas(formulas).setVerticalAlignment('top');
  s.getRange('A6:A').setHorizontalAlignment('left').setVerticalAlignment('top');
  s.getRange('C6:C').setWrap(true);

  s.setColumnWidth(1, 220);
  s.setColumnWidth(2, 110);
  s.setColumnWidth(3, 560);
  s.setFrozenRows(5);
}

function reply(object) {
  return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON);
}
