import { NextResponse } from 'next/server';
import base from '../../lib/airtable';

export async function GET(request) {
  try {
    const records = await base('WEBTOON').select({
      maxRecords: 100,
      sort: [{ field: 'title', direction: 'asc' }],
    }).all();

    const webtoons = records.map(r => ({
      id: r.id,
      title: r.fields.title,
      author: r.fields.author,
      platform: r.fields.platform,
      genre: r.fields.genre,
      status: r.fields.status,
      thumbnail_url: r.fields.thumbnail_url,
    }));

    return NextResponse.json(webtoons);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}