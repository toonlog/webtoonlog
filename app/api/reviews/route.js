import { NextResponse } from 'next/server';
import base from '../../lib/airtable';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const webtoonId = searchParams.get('webtoonId');

    const records = await base('REVIEW').select({
      filterByFormula: `FIND("${webtoonId}", ARRAYJOIN({webtoon}))`,
      sort: [{ field: 'created_at', direction: 'desc' }],
    }).all();

    const reviews = records.map(record => ({
      id: record.id,
      ...record.fields,
    }));

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { webtoonId, nickname, rating, content } = body;

    const record = await base('REVIEW').create({
      rating: Number(rating),
      content: content,
      is_spoiler: false,
      created_at: new Date().toISOString().split('T')[0],
      webtoon: [webtoonId],
    });

    return NextResponse.json({ id: record.id, ...record.fields });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}