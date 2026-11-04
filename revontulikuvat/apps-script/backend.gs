/**
 * Book Lapland – Northern lights photos: Google Sheets backend
 *
 * The website (Vercel) sends every sign-up here. The script stores it on the
 * Responses sheet, guides log their group and camera on the Guides sheet, and
 * the Morning sheet lists last night's emails, guide and camera by group.
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
  ensureGuidesSheet(spreadsheet);

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

/** Sign-ups and guide logs from the website arrive here. */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const props = PropertiesService.getScriptProperties();
    if (!data || data.secret !== props.getProperty('SECRET')) return reply({ ok: false, error: 'forbidden' });
    if (data.kind === 'guide') return logGuide(data, props);

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

/** A guide's group, name and camera for tonight, from the /guide page. */
function logGuide(data, props) {
  const group = String(data.group || '').trim().toUpperCase();
  // Same checks as the website; a leading = + - @ would be read as a formula
  const text = (value, max) => {
    const t = String(value || '').trim().replace(/\s+/g, ' ');
    return t && t.length <= max && !/^[=+\-@]/.test(t) ? t : null;
  };
  const guide = text(data.guide, 40);
  const camera = text(data.camera, 20);
  if (!/^S?\d{1,3}$/.test(group)) return reply({ ok: false, error: 'group' });
  if (!guide) return reply({ ok: false, error: 'guide' });
  if (!camera) return reply({ ok: false, error: 'camera' });

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const guides = ensureGuidesSheet(SpreadsheetApp.openById(props.getProperty('SHEET_ID')));
    guides.appendRow([new Date(), /^\d+$/.test(group) ? Number(group) : group, guide, camera]);
  } finally {
    lock.releaseLock();
  }
  return reply({ ok: true });
}

function ensureGuidesSheet(spreadsheet) {
  let guides = spreadsheet.getSheetByName('Guides');
  if (!guides) {
    guides = spreadsheet.insertSheet('Guides');
    guides.getRange('A1:D1').setValues([['Time', 'Group', 'Guide', 'Camera']]).setFontWeight('bold');
    guides.setFrozenRows(1);
    guides.getRange('A2:A').setNumberFormat('ddd d mmm yyyy HH:mm');
    guides.getRange('D2:D').setNumberFormat('@'); // camera as plain text, so "03" stays "03"
    guides.setColumnWidth(1, 170);
    guides.setColumnWidth(3, 200);
  }
  return guides;
}

/**
 * Adds the Guides sheet and the Guide and Camera columns to an existing Morning sheet.
 * Run once in spreadsheets set up before guides could log their camera. Safe to run again.
 */
function addGuideColumns() {
  const spreadsheet = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
  ensureGuidesSheet(spreadsheet);
  buildMorningSheet(spreadsheet);
  Logger.log('Done: Guides sheet and Guide/Camera columns are in place.');
}

/** Opened in a browser, shows that the service is running. */
function doGet() {
  return reply({ ok: true, service: 'northern-lights-photos' });
}

/** Deletes rows older than retentionDays from Responses and Guides. Runs every night. */
function deleteOldRows() {
  const spreadsheet = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
  ['Responses', 'Guides'].forEach((name) => {
    const sheet = spreadsheet.getSheetByName(name);
    if (sheet) deleteOldRowsIn(sheet);
  });
}

function deleteOldRowsIn(responses) {
  const cutoff = new Date(Date.now() - SETTINGS.retentionDays * 24 * 3600 * 1000);
  const isOld = (value) => value instanceof Date && value < cutoff;

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
  // Guide and camera per group, logged on the /guide page
  const crew = {};
  const guides = spreadsheet.getSheetByName('Guides');
  const guideRows = !guides || guides.getLastRow() < 2 ? [] : guides.getRange(2, 1, guides.getLastRow() - 1, 4).getValues();
  guideRows.forEach(([time, group, guide, camera]) => {
    if (!(time instanceof Date)) return;
    if (Utilities.formatDate(new Date(time.getTime() - shift), tz, 'yyyy-MM-dd') !== lastNight) return;
    // Arrays keep the order the guides logged in
    const entry = (crew[String(group)] = crew[String(group)] || { guides: [], cameras: [] });
    if (guide && !entry.guides.includes(guide)) entry.guides.push(guide);
    if (camera !== '' && !entry.cameras.includes(String(camera))) entry.cameras.push(String(camera));
  });

  // Bus groups 1, 2, 10 first, then small groups S1, S2, S10
  const order = (code) => [/^S/.test(code) ? 1 : 0, Number(code.replace(/\D/g, '')) || 0, code];
  const list = Object.keys(groups)
    .sort((a, b) => {
      const x = order(a), y = order(b);
      return x[0] - y[0] || x[1] - y[1] || x[2].localeCompare(y[2]);
    })
    .map((group) => ({
      group,
      name: groupName(group),
      count: Object.keys(groups[group]).length,
      guide: crew[group] ? crew[group].guides.join(', ') : '',
      camera: crew[group] ? crew[group].cameras.join(', ') : '',
    }));
  const total = list.reduce((sum, g) => sum + g.count, 0);
  if (!total && !sendWhenEmpty) return;

  const nightText = Utilities.formatDate(new Date(Date.now() - 24 * 3600 * 1000), tz, 'EEE d MMM');
  const link = spreadsheet.getUrl() + '#gid=' + morning.getSheetId();
  const subject = total
    ? `Northern lights photos to send – ${total} email${total === 1 ? '' : 's'} from ${nightText}`
    : `Northern lights photos – no sign-ups on ${nightText}`;

  const cell = 'padding:6px 16px 6px 0;border-bottom:1px solid #e2e8f2';
  const rowsHtml =
    `<tr style="font-size:12px;color:#5d7189;text-align:left"><th style="${cell}">Group</th><th style="${cell}">Guide</th>` +
    `<th style="${cell}">Camera</th><th style="${cell};text-align:right">Emails</th></tr>` +
    list.map((g) =>
      `<tr><td style="${cell}"><b>${escapeHtml(g.name)}</b></td>` +
      `<td style="${cell}">${escapeHtml(g.guide || '–')}</td>` +
      `<td style="${cell}">${escapeHtml(g.camera || '–')}</td>` +
      `<td style="${cell};text-align:right">${g.count}</td></tr>`).join('');
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
        list.map((g) => `- ${g.name}: ${g.count}` +
          (g.guide || g.camera ? ` (guide ${g.guide || '–'}, camera ${g.camera || '–'})` : '')).join('\n')
      : `No sign-ups on ${nightText}.`) +
    `\n\nOpen the Morning sheet: ${link}\n\n` +
    'Copy each group\'s email addresses into the BCC field and send the link to the group\'s photos.';

  MailApp.sendEmail({ to: SETTINGS.reminderTo, subject, body, htmlBody, name: 'Book Lapland Photos' });
}

/** "S7" → "Small Group 7", "7" → "Bus Group 7". */
function groupName(code) {
  const small = /^S(\d+)$/.exec(code);
  return small ? 'Small Group ' + small[1] : 'Bus Group ' + code;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

// B1 can hold a real date or text typed as 1.11.2026 / 1/11/2026 (day first). Empty = last night.
const PICKED_NIGHT_FORMULA =
  '=IF(B1="",TODAY()-1,IF(ISNUMBER(B1),INT(B1),IFERROR(DATE(INDEX(SPLIT(B1,"./-"),1,3),' +
  'INDEX(SPLIT(B1,"./-"),1,2),INDEX(SPLIT(B1,"./-"),1,1)),"Check the date in B1")))';

/** Fixes the date picker on an existing Morning sheet (B1/B2). Safe to run again. */
function fixDatePicker() {
  const s = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'))
    .getSheetByName('Morning');
  s.getRange('B1').setDataValidation(SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(true).build());
  s.getRange('B2').setFormula(PICKED_NIGHT_FORMULA).setNumberFormat('ddd d mmm yyyy');
}

function buildMorningSheet(spreadsheet) {
  const s = spreadsheet.getSheetByName('Morning');
  const time = 'Responses!$A$2:$A';
  const group = 'Responses!$B$2:$B';
  const email = 'Responses!$C$2:$C';
  const onDay = `${time}<>"",INT(${time}-${SETTINGS.dayStartsAtHour}/24)=$B$2`;
  const guideTime = 'Guides!$A$2:$A';
  const guideOnDay = `${guideTime}<>"",INT(${guideTime}-${SETTINGS.dayStartsAtHour}/24)=$B$2`;

  s.getRange('A1:A3').setValues([
    ['Pick a date (empty = last night):'],
    ['Showing tour night of:'],
    [''],
  ]);
  s.getRange('B1:B2').setNumberFormat('ddd d mmm yyyy');
  // Date picker on B1 (double-click). Typed text like 01.11.2026 is still accepted and read by B2.
  s.getRange('B1').setBackground('#fff8c5')
    .setDataValidation(SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(true).build());
  s.getRange('B2').setFormula(PICKED_NIGHT_FORMULA).setFontWeight('bold');
  s.getRange('A3').setFormula(
    `="Emails in total: "&IFERROR(ROWS(FILTER(${email},${onDay})),0)`);

  s.getRange('A5:E5')
    .setValues([['Group (S = Small Group)', 'Guide', 'Camera', 'Emails', 'Email addresses – paste into the BCC field']])
    .setFontWeight('bold')
    .setBackground('#e8eef7');
  // Bus groups 1, 2, 10 first, then small groups S1, S2, S10
  s.getRange('A6').setFormula(
    `=IFERROR(ARRAYFORMULA(LET(g,UNIQUE(FILTER(${group},${onDay})),` +
    `SORT(g,ISTEXT(g),TRUE,IFERROR(VALUE(REGEXREPLACE(g&"","[^0-9]","")),0),TRUE,g&"",TRUE))),"")`);

  const formulas = [];
  for (let r = 6; r < 6 + SETTINGS.morningRows; r++) {
    const addresses = `UNIQUE(LOWER(TRIM(FILTER(${email},${onDay},${group}=$A${r}))))`;
    const fromGuides = (col) =>
      `=IF($A${r}="","",IFERROR(TEXTJOIN(", ",TRUE,UNIQUE(FILTER(Guides!$${col}$2:$${col},${guideOnDay},Guides!$B$2:$B=$A${r}))),""))`;
    formulas.push([
      fromGuides('C'),
      fromGuides('D'),
      `=IF($A${r}="","",ARRAYFORMULA(COUNTA(${addresses})))`,
      `=IF($A${r}="","",ARRAYFORMULA(TEXTJOIN(", ",TRUE,${addresses})))`,
    ]);
  }
  s.getRange(6, 2, SETTINGS.morningRows, 4).setFormulas(formulas).setVerticalAlignment('top');
  s.getRange('A6:A').setHorizontalAlignment('left').setVerticalAlignment('top');
  s.getRange('C6:C').setWrap(false);
  s.getRange('E6:E').setWrap(true);

  s.setColumnWidth(1, 220);
  s.setColumnWidth(2, 150);
  s.setColumnWidth(3, 90);
  s.setColumnWidth(4, 80);
  s.setColumnWidth(5, 560);
  s.setFrozenRows(5);
}

function reply(object) {
  return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON);
}
