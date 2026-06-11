import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';

async function recalcRating(webtoonId) {
  const reviews = await base('REVIEW').select({
    filterByFormula: `{webtoon_id} = "${webtoonId}"`,
  }).all();
  const rated = reviews.filter(r => !r.fields.is_wishlist);
  const count = rated.length;
  const avg = count > 0
    ? Math.round((rated.reduce((s, r) => s + (r.fields.rating || 0), 0) / count) * 10) / 10
    : 0;
  await base('WEBTOON').update(webtoonId, { avg_rating: avg, review_count: count });
  return { avg_rating: avg, review_count: count };
}

export async function POST(request, context) {
  try {
    const { id } = await context.params;
    const result = await recalcRating(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const record = await base('WEBTOON').find(id);
    return NextResponse.json({
      id: record.id,
      title: record.fields.title,
      author: record.fields.author,
      platform: record.fields.platform,
      genre: record.fields.genre,
      status: record.fields.status,
      thumbnail_url: record.fields.thumbnail_url,
      avg_rating: record.fields.avg_rating,
      review_count: record.fields.review_count,
      description: record.fields.description,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}