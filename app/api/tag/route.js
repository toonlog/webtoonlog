import { NextResponse } from 'next/server';
import base from '../../lib/airtable';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('name');

    const records = await base('REVIEW').select({
      fields: ['webtoon_id', 'tags'],
    }).all();

    const webtoonIds = [...new Set(
      records
        .filter(r => {
          const rawTags = r.fields.tags;
          if (!rawTags || typeof rawTags !== 'string') return false;
          return rawTags.split(',').map(t => t.trim()).includes(tag);
        })
        .map(r => r.fields.webtoon_id)
        .filter(Boolean)
    )];

    if (webtoonIds.length === 0) return NextResponse.json([]);

    const webtoons = await Promise.all(webtoonIds.map(async (wId) => {
      try {
        const r = await base('WEBTOON').find(wId);
        return { id: r.id, ...r.fields };
      } catch { return null; }
    }));

    return NextResponse.json(webtoons.filter(Boolean));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}