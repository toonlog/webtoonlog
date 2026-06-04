import { NextResponse } from 'next/server';
import base from '../../lib/airtable';

export async function GET() {
  try {
    const records = await base('WEBTOON').select({
      maxRecords: 100,
      view: 'Grid view',
    }).all();

    const webtoons = records.map(record => ({
      id: record.id,
      ...record.fields,
    }));

    return NextResponse.json(webtoons);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
