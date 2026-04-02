/**
 * GOOGLE APPS SCRIPT BACKEND CODE
 * 
 * Instructions:
 * 1. Create a new Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this code into the editor.
 * 4. Deploy as a Web App (Execute as: Me, Who has access: Anyone).
 * 5. Copy the Web App URL and set it as VITE_GOOGLE_SCRIPT_URL in your .env.
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const data = {};
  
  const sheets = ss.getSheets();
  sheets.forEach(sheet => {
    const name = sheet.getName();
    const values = sheet.getDataRange().getValues();
    if (values.length > 1) {
      const headers = values[0];
      const rows = values.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = row[i];
        });
        return obj;
      });
      data[name] = rows;
    } else {
      data[name] = [];
    }
  });
  
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const payload = JSON.parse(e.postData.contents);
  const { action, sheetName, data } = payload;
  
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const headers = Object.keys(data);
    sheet.appendRow(headers);
  }
  
  if (action === 'add') {
    const headers = sheet.getDataRange().getValues()[0];
    const row = headers.map(h => data[h] || '');
    sheet.appendRow(row);
  } else if (action === 'update') {
    // Basic update logic based on an 'id' or first column
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const idIndex = 0; // Assuming first column is ID
    for (let i = 1; i < values.length; i++) {
      if (values[i][idIndex] == data[headers[idIndex]]) {
        const newRow = headers.map(h => data[h] !== undefined ? data[h] : values[i][headers.indexOf(h)]);
        sheet.getRange(i + 1, 1, 1, headers.length).setValues([newRow]);
        break;
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
