import { google } from 'googleapis';

export async function getGoogleSheetsClient() {
  try {
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
      throw new Error('Missing Google Sheets credentials');
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
  } catch (error) {
    console.error('Error authenticating with Google Sheets:', error);
    throw new Error('Failed to authenticate with Google Sheets');
  }
}

export async function appendTransaction(data: (string | number)[]) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    
    if (!spreadsheetId) {
      throw new Error('Missing Spreadsheet ID');
    }

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Transactions!A:E', // Assuming columns: Date, Type, Account, Amount, Category, Notes, etc.
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [data],
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error appending transaction:', error);
    throw error;
  }
}

export async function getTransactions() {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('Missing Spreadsheet ID');
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Transactions!A:Z',
    });

    return response.data.values || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}
