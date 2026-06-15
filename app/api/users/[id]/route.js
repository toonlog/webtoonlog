import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';

export async function GET(request, context) {
  try {
    const { id } = await context.params;

    const userRecord = await base('USER').find(id);
    const user = {
      id: userRecord.id,
      nickname: userRecord.fields.nickname,
      created_at: userRecord.fields.created_at,
      profile_image: userRecord.fields.profile_image || null,
    };

    const reviewRecords = await base('REVIEW').select({
      filterByFormula: `{user_id} = "${id}"`,
      sort: [{ field: 'created_at', direction: 'desc' }],
    }).all();

    const statusRecords = await base('READING_STATUS').select({
      filterByFormula: `{user_id} = "${id}"`,
      sort: [{ field: 'updated_at', direction: 'desc' }],
    }).all();

    const followerRecords = await base('FOLLOW').select({
      filterByFormula: `{following_id} = "${id}"`,
    }).all();

    const followingRecords = await base('FOLLOW').select({
      filterByFormula: `{follower_id} = "${id}"`,
    }).all();

    const webtoonIds = [...new Set([
      ...reviewRecords.map(r => r.fields.webtoon_id).filter(Boolean),
      ...statusRecords.map(r => r.fields.webtoon_id).filter(Boolean),
    ])];

    const webtoonMap = {};
    await Promise.all(webtoonIds.map(async (wId) => {
      try {
        const rec = await base('WEBTOON').find(wId);
       webtoonMap[wId] = {
          title: rec.fields.title,
          thumbnail_url: rec.fields.thumbnail_url || null,
          genre: rec.fields.genre || '',
        };
      } catch { webtoonMap[wId] = { title: wId, thumbnail_url: null, genre: '' }; }
    }));

  const reviews = reviewRecords
      .filter(r => r.fields.is_public !== false)
      .map(r => ({
        id: r.id,
        webtoon_id: r.fields.webtoon_id || null,
        webtoon_title: webtoonMap[r.fields.webtoon_id]?.title || null,
        thumbnail_url: webtoonMap[r.fields.webtoon_id]?.thumbnail_url || null,
        genre: webtoonMap[r.fields.webtoon_id]?.genre || '',
        rating: r.fields.rating,
        content: r.fields.content,
        tags: r.fields.tags || '',
        created_at: r.fields.created_at,
      }));

    const statuses = statusRecords.map(r => ({
      id: r.id,
      webtoon_id: r.fields.webtoon_id || null,
      webtoon_title: webtoonMap[r.fields.webtoon_id]?.title || null,
      status: r.fields.status,
      updated_at: r.fields.updated_at,
    }));

    return NextResponse.json({
      user,
      reviews,
      statuses,
      followerCount: followerRecords.length,
      followingCount: followingRecords.length,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}