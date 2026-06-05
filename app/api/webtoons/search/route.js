import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (!q.trim()) return NextResponse.json([]);

    const records = await base('WEBTOON').select({
      maxRecords: 100,
      sort: [{ field: 'title', direction: 'asc' }],
    }).all();

    const all = records.map(r => ({
      id: r.id,
      title: r.fields.title || '',
      author: r.fields.author || '',
      platform: Array.isArray(r.fields.platform) ? r.fields.platform : (r.fields.platform ? [r.fields.platform] : []),
      genre: r.fields.genre || '',
      thumbnail_url: r.fields.thumbnail_url || '',
    }));

const filtered = all.filter(w =>
  w.title.includes(q) ||
  w.author.includes(q) ||
  w.platform.some(p => p.includes(q))
);

    return NextResponse.json(filtered);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}