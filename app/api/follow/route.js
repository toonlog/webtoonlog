import { NextResponse } from 'next/server';
import base from '../../lib/airtable';
import { getUserFromRequest } from '../../lib/auth';

// 팔로우 상태 확인
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const followingId = searchParams.get('followingId');
    const followerId = searchParams.get('followerId');

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

// 팔로우 / 언팔로우 토글
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

    return NextResponse.json({ isFollowing: true, message: '팔로우했어요' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}