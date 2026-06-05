import { NextResponse } from 'next/server';
import base from '../../lib/airtable';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const boom = searchParams.get('boom');

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
      thumbnail_url: r.fields.thumbnail_url,
      avg_rating: r.fields.avg_rating,
      review_count: r.fields.review_count,
    }));

    if (boom) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const dateStr = oneWeekAgo.toISOString().split('T')[0];

      const recentReviews = await base('REVIEW').select({
        filterByFormula: `{created_at} >= "${dateStr}"`,
      }).all();

      const countMap = {};
      recentReviews.forEach(r => {
        const wId = r.fields.webtoon_id;
        if (wId) countMap[wId] = (countMap[wId] || 0) + 1;
      });

      const boomWebtoons = webtoons
        .filter(w => countMap[w.id])
        .sort((a, b) => (countMap[b.id] || 0) - (countMap[a.id] || 0))
        .slice(0, 5);

      return NextResponse.json(boomWebtoons);
    }

    return NextResponse.json(webtoons);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}