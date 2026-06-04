import { NextResponse } from 'next/server';
import base from '../../lib/airtable';
import { getUserFromRequest } from '../../lib/auth';

export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const reviewRecords = await base('REVIEW').select({
      filterByFormula: `{user_id} = "${userId}"`,
      sort: [{ field: 'created_at', direction: 'desc' }],
    }).all();

    const statusRecords = await base('READING_STATUS').select({
      filterByFormula: `{user_id} = "${userId}"`,
      sort: [{ field: 'updated_at', direction: 'desc' }],
    }).all();

    const webtoonIds = [...new Set([
      ...reviewRecords.map(r => r.fields.webtoon_id).filter(Boolean),
      ...statusRecords.map(r => r.fields.webtoon_id).filter(Boolean),
    ])];

    const webtoonMap = {};
    await Promise.all(webtoonIds.map(async (wId) => {
      try {
        const rec = await base('WEBTOON').find(wId);
        webtoonMap[wId] = rec.fields.title;
      } catch { webtoonMap[wId] = wId; }
    }));

    const reviews = reviewRecords.map(r => ({
      id: r.id,
      webtoon_id: r.fields.webtoon_id || null,
      webtoon_title: webtoonMap[r.fields.webtoon_id] || null,
      rating: r.fields.rating,
      content: r.fields.content,
      created_at: r.fields.created_at,
    }));

    const statuses = statusRecords.map(r => ({
      id: r.id,
      webtoon_id: r.fields.webtoon_id || null,
      webtoon_title: webtoonMap[r.fields.webtoon_id] || null,
      status: r.fields.status,
      updated_at: r.fields.updated_at,
    }));

    return NextResponse.json({ reviews, statuses });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}