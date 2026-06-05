import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    const records = await base('WEBTOON').select({
      maxRecords: 100,
      sort: [{ field: 'title', direction: 'asc' }],
    }).all();

    const all = records.map(r => ({
      id: r.id,
      title: r.fields.title || '',
      author: r.fields.author || '',
      platform: r.fields.platform || '',
      genre: r.fields.genre || '',
      thumbnail_url: r.fields.thumbnail_url || '',
    }));

    const filtered = q.trim()
      ? all.filter(w =>
          w.title.includes(q) ||
          w.author.includes(q) ||
          (typeof w.genre === 'string' && w.genre.includes(q)) ||
          (Array.isArray(w.platform) && w.platform.some(p => p.includes(q)))
        )
      : all;

    return NextResponse.json(filtered);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}