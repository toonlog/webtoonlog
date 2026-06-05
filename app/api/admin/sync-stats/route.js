import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';

export async function GET() {
  try {
    const webtoons = await base('WEBTOON').select().all();

    for (const webtoon of webtoons) {
      const reviews = await base('REVIEW').select({
        filterByFormula: `{webtoon_id} = "${webtoon.id}"`,
      }).all();

      const count = reviews.length;
      const avg = count > 0
        ? reviews.reduce((sum, r) => sum + (r.fields.rating || 0), 0) / count
        : 0;

      await base('WEBTOON').update(webtoon.id, {
        avg_rating: Math.round(avg * 10) / 10,
        review_count: count,
      });
    }

    return NextResponse.json({ success: true, updated: webtoons.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
