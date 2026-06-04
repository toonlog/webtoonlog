import { NextResponse } from 'next/server';
import base from '../../lib/airtable';

export async function POST(request) {
  try {
    const body = await request.json();
    const { webtoonId, nickname, status } = body;

    const record = await base('READING_STATUS').create({
      status,
      updated_at: new Date().toISOString().split('T')[0],
      webtoon: [webtoonId],
    });

    return NextResponse.json({ id: record.id, ...record.fields });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}