import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';
import { getUserFromRequest } from '../../../lib/auth';

export async function DELETE(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const userId = user.userId;

    // 내 리뷰 삭제
    const reviews = await base('REVIEW').select({
      filterByFormula: `{user_id} = "${userId}"`,
    }).all();
    await Promise.all(reviews.map(r => base('REVIEW').destroy(r.id)));

    // 내 읽기 상태 삭제
    const statuses = await base('READING_STATUS').select({
      filterByFormula: `{user_id} = "${userId}"`,
    }).all();
    await Promise.all(statuses.map(r => base('READING_STATUS').destroy(r.id)));

    // 내 컬렉션 아이템 삭제
    const collections = await base('COLLECTION').select({
      filterByFormula: `{user_id} = "${userId}"`,
    }).all();
    await Promise.all(collections.map(async c => {
      const items = await base('COLLECTION_ITEM').select({
        filterByFormula: `{collection_id} = "${c.id}"`,
      }).all();
      await Promise.all(items.map(i => base('COLLECTION_ITEM').destroy(i.id)));
      await base('COLLECTION').destroy(c.id);
    }));

    // 팔로우 데이터 삭제
    const follows = await base('FOLLOW').select({
      filterByFormula: `OR({follower_id} = "${userId}", {following_id} = "${userId}")`,
    }).all();
    await Promise.all(follows.map(r => base('FOLLOW').destroy(r.id)));

    // 유저 삭제
    await base('USER').destroy(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}