/**
 * Contact form -> Google Sheet
 * =========================================================================
 * This script receives POST submissions from the portfolio contact form
 * and appends each one as a new row in a Google Sheet.
 *
 * ---------------------------------------------------------------------------
 * ONE-TIME SETUP
 * ---------------------------------------------------------------------------
 * 1. Create a Google Sheet (sheets.new). Name it anything, e.g. "Portfolio
 *    Messages". You do NOT need to add headers — the script adds them.
 *
 * 2. In that Sheet: Extensions -> Apps Script. Delete any starter code,
 *    paste THIS entire file, and Save (disk icon).
 *
 * 3. Deploy: click "Deploy" -> "New deployment".
 *      - Select type (gear icon) -> "Web app"
 *      - Description:            contact form
 *      - Execute as:            "Me"
 *      - Who has access:        "Anyone"          <-- important
 *      - Click "Deploy", then "Authorize access" and allow the permissions
 *        (you'll see an "unverified app" screen — click Advanced ->
 *         "Go to <project> (unsafe)"; it's your own script).
 *
 * 4. Copy the "Web app" URL. It looks like:
 *      https://script.google.com/macros/s/AKfycb....../exec
 *
 * 5. Open index.html, find the contact <form>, and paste that URL into the
 *    `action="..."` attribute (replacing PASTE_YOUR_DEPLOYMENT_ID/exec).
 *
 * 6. Test the form on the live site. A new row should appear in the Sheet.
 *
 * NOTE: whenever you change this script, you must "Deploy" -> "Manage
 * deployments" -> edit the existing one -> "Version: New version" for the
 * change to go live (the /exec URL stays the same).
 * ---------------------------------------------------------------------------
 */

var SHEET_NAME = 'Messages';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // avoid two submissions writing the same row

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Add a header row the first time.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Message']);
    }

    var p = (e && e.parameter) ? e.parameter : {};

    // Honeypot: bots fill the hidden "_gotcha" field — ignore those.
    if (p._gotcha) {
      return json({ result: 'ignored' });
    }

    sheet.appendRow([
      new Date(),
      p.name || '',
      p.email || '',
      p.message || ''
    ]);

    return json({ result: 'success' });
  } catch (err) {
    return json({ result: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Lets you open the /exec URL in a browser to confirm the app is live.
function doGet() {
  return json({ status: 'ok', message: 'Contact endpoint is running.' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
