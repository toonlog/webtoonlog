import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';

export async function POST(request) {
  try {
    const body = await request.json();
  const { title, author, platform, genre, status, thumbnailUrl, link } = body;

    if (!title) return NextResponse.json({ error: '제목은 필수입니다' }, { status: 400 });

   const record = await base('WEBTOON').create({
      title,
      author: author || '',
      platform: Array.isArray(platform) ? platform : (platform ? [platform] : []),
      genre: Array.isArray(genre) ? genre.join(',') : (genre || ''),
      status: status || '연재중',
      thumbnail_url: thumbnailUrl || '',
      link: link || '',
    }, { typecast: true });

    return NextResponse.json({ id: record.id, ...record.fields });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}