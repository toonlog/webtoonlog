import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, author, platform, genre, status, thumbnailUrl } = body;

    if (!title) return NextResponse.json({ error: '제목은 필수입니다' }, { status: 400 });

    const record = await base('WEBTOON').create({
      title,
      author: author || '',
      platform: platform ? [platform] : [],
      genre: genre ? [genre] : [],
      status: status || '연재중',
      thumbnail_url: thumbnailUrl || '',
      avg_rating: 0,
      review_count: 0,
    });

    return NextResponse.json({ id: record.id, ...record.fields });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}