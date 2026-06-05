import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';
import { getUserFromRequest } from '../../../lib/auth';

export async function GET(request, context) {
  try {
    const { id } = await context.params;

    const userRecord = await base('USER').find(id);
    const user = {
      id: userRecord.id,
      nickname: userRecord.fields.nickname,
      created_at: userRecord.fields.created_at,
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

export async function DELETE(request, context) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const { id } = await context.params;
    if (user.userId !== id) return NextResponse.json({ error: '본인 계정만 탈퇴할 수 있어요' }, { status: 403 });

    // 리뷰 삭제
    const reviews = await base('REVIEW').select({
      filterByFormula: `{user_id} = "${id}"`,
    }).all();
    await Promise.all(reviews.map(r => base('REVIEW').destroy(r.id)));

    // 읽기 상태 삭제
    const statuses = await base('READING_STATUS').select({
      filterByFormula: `{user_id} = "${id}"`,
    }).all();
    await Promise.all(statuses.map(r => base('READING_STATUS').destroy(r.id)));

    // 컬렉션 삭제
    const collections = await base('COLLECTION').select({
      filterByFormula: `{user_id} = "${id}"`,
    }).all();
    await Promise.all(collections.map(async (c) => {
      const items = await base('COLLECTION_ITEM').select({
        filterByFormula: `{collection_id} = "${c.id}"`,
      }).all();
      await Promise.all(items.map(i => base('COLLECTION_ITEM').destroy(i.id)));
      await base('COLLECTION').destroy(c.id);
    }));

    // 팔로우 삭제
    const follows = await base('FOLLOW').select({
      filterByFormula: `OR({follower_id} = "${id}", {following_id} = "${id}")`,
    }).all();
    await Promise.all(follows.map(r => base('FOLLOW').destroy(r.id)));

    // 유저 삭제
    await base('USER').destroy(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}