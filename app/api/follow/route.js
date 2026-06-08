import { NextResponse } from 'next/server';
import base from '../../lib/airtable';
import { getUserFromRequest } from '../../lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const followingId = searchParams.get('followingId');
    const followerId = searchParams.get('followerId');
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');

    if (userId && type) {
      const formula = type === 'followers'
        ? `{following_id} = "${userId}"`
        : `{follower_id} = "${userId}"`;
      const records = await base('FOLLOW').select({ filterByFormula: formula }).all();
      const userIds = records.map(r => type === 'followers' ? r.fields.follower_id : r.fields.following_id);
      if (userIds.length === 0) return NextResponse.json([]);
      const users = await Promise.all(userIds.map(async uid => {
        try {
          const r = await base('USER').find(uid);
          return { id: r.id, nickname: r.fields.nickname, profile_image: r.fields.profile_image || null };
        } catch { return null; }
      }));
      return NextResponse.json(users.filter(Boolean));
    }

    if (!followingId || !followerId) return NextResponse.json({ isFollowing: false });

    const records = await base('FOLLOW').select({
      filterByFormula: `AND({follower_id} = "${followerId}", {following_id} = "${followingId}")`,
      maxRecords: 1,
    }).firstPage();

    return NextResponse.json({ isFollowing: records.length > 0 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const { followingId } = await request.json();

    if (user.userId === followingId) {
      return NextResponse.json({ error: '자기 자신은 팔로우할 수 없어요' }, { status: 400 });
    }

    const existing = await base('FOLLOW').select({
      filterByFormula: `AND({follower_id} = "${user.userId}", {following_id} = "${followingId}")`,
      maxRecords: 1,
    }).firstPage();

    if (existing.length > 0) {
      await base('FOLLOW').destroy(existing[0].id);
      return NextResponse.json({ isFollowing: false, message: '언팔로우했어요' });
    }

    await base('FOLLOW').create({
      follower_id: user.userId,
      following_id: followingId,
      followed_at: new Date().toISOString().split('T')[0],
    });

    // 팔로우 알람
    try {
      const { createNotification } = await import('../../lib/notification');
      await createNotification({
        userId: followingId,
        type: 'follow',
        actorId: user.userId,
        actorNickname: user.nickname,
        targetId: user.userId,
        targetType: 'user',
        webtoonId: '',
      });
    } catch (e) { console.error('알람 실패:', e.message); }

    return NextResponse.json({ isFollowing: true, message: '팔로우했어요' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}