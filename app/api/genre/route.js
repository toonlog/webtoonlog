import { NextResponse } from 'next/server';
import base from '../../lib/airtable';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('name');

    const records = await base('WEBTOON').select({
      maxRecords: 100,
      sort: [{ field: 'title', direction: 'asc' }],
    }).all();

    const webtoons = records
      .map(r => ({ id: r.id, ...r.fields }))
      .filter(w => {
        if (!w.genre) return false;
        const genres = w.genre.split(',').map(g => g.trim());
        return genres.includes(genre);
      });

    return NextResponse.json(webtoons);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}