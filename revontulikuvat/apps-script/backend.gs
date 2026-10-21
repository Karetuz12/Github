/**
 * Book Lapland – Northern lights photos: Google Sheets backend
 *
 * The website (Vercel) sends every sign-up here. The script stores it on the
 * Responses sheet, and the Morning sheet lists last night's emails by group.
 * Rows older than 30 days are deleted every night.
 *
 * Setup: see revontulikuvat/GUIDE.md.
 */

const SETTINGS = {
  retentionDays: 30,      // emails are deleted automatically after this
  dayStartsAtHour: 6,     // sign-ups until 06:00 belong to the previous night's tour
  morningRows: 50,        // how many groups the Morning sheet can show for one day
  spreadsheetName: 'Book Lapland – Northern Lights Photos',
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
  ScriptApp.newTrigger('deleteOldRows').timeBased().everyDays(1).atHour(4).create();
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
