import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';

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