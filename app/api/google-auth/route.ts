import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const { google } = await import('googleapis');
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    const drive = google.drive({ version: 'v3', auth });
    const res = await drive.files.list({ pageSize: 10 });
    return NextResponse.json(res.data);
  } catch (err) {
    console.error('Google API Error:', err);
    return NextResponse.json({ error: 'Error using googleapis', details: err instanceof Error ? err.message : err }, { status: 500 });
  }
} 