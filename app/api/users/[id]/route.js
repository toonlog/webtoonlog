import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';

export async function GET(request, context) {
  try {
    const { id } = await context.params;

    // 유저 정보
    const userRecord = await base('USER').find(id);
    const user = {
      id: userRecord.id,
      nickname: userRecord.fields.nickname,
      created_at: userRecord.fields.created_at,
    };

    // 유저 리뷰
    const reviewRecords = await base('REVIEW').select({
      filterByFormula: `{user_id} = "${id}"`,
      sort: [{ field: 'created_at', direction: 'desc' }],
    }).all();

    // 유저 읽기 상태
    const statusRecords = await base('READING_STATUS').select({
      filterByFormula: `{user_id} = "${id}"`,
      sort: [{ field: 'updated_at', direction: 'desc' }],
    }).all();

    // 팔로워/팔로잉 수
    const followerRecords = await base('FOLLOW').select({
      filterByFormula: `{following_id} = "${id}"`,
    }).all();

    const followingRecords = await base('FOLLOW').select({
      filterByFormula: `{follower_id} = "${id}"`,
    }).all();

    // 웹툰 제목 가져오기
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