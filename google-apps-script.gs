/**
 * Contact form -> Google Sheet
 * =========================================================================
 * This script receives POST submissions from the portfolio contact form,
 * appends each one as a new row in a Google Sheet, AND emails you a
 * notification for every message (set NOTIFY_EMAIL below, or '' to disable).
 *
 * Because it sends email, the authorization step (below) will also ask for
 * permission to "send email as you" — that's expected. Replies to the
 * notification go straight to the person who filled in the form.
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

// Where to email each new submission. Leave '' to turn notifications off.
var NOTIFY_EMAIL = 'uttamsangani2@gmail.com';

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

    var name = p.name || '';
    var email = p.email || '';
    var message = p.message || '';

    sheet.appendRow([new Date(), name, email, message]);

    // Email a notification (never let a mail failure block the save).
    if (NOTIFY_EMAIL) {
      try {
        MailApp.sendEmail({
          to: NOTIFY_EMAIL,
          subject: 'New portfolio message from ' + (name || 'someone'),
          replyTo: email || NOTIFY_EMAIL, // reply goes straight to the sender
          body:
            'Name:    ' + name + '\n' +
            'Email:   ' + email + '\n\n' +
            'Message:\n' + message + '\n'
        });
      } catch (mailErr) {
        // swallow — the row is already saved to the sheet
      }
    }

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
