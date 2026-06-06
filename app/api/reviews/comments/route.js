import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';
import { getUserFromRequest } from '../../../lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    const records = await base('REVIEW_COMMENT').select({
      filterByFormula: `{review_id} = "${reviewId}"`,
      sort: [{ field: 'created_at', direction: 'asc' }],
    }).all();

  const userIds = [...new Set(records.map(r => r.fields.user_id).filter(Boolean))];
    const userMap = {};
    await Promise.all(userIds.map(async (uid) => {
      try {
        const u = await base('USER').find(uid);
        userMap[uid] = u.fields.profile_image || null;
      } catch { userMap[uid] = null; }
    }));

    return NextResponse.json(records.map(r => ({
      id: r.id,
      userId: r.fields.user_id,
      nickname: r.fields.nickname,
      profileImage: userMap[r.fields.user_id] || null,
      content: r.fields.content,
      created_at: r.fields.created_at,
    })));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const { reviewId, content } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: '내용을 입력해주세요' }, { status: 400 });

    const record = await base('REVIEW_COMMENT').create({
      review_id: reviewId,
      user_id: user.userId,
      nickname: user.nickname,
      content: content.trim(),
      created_at: new Date().toISOString().split('T')[0],
    });

    return NextResponse.json({
      id: record.id,
      userId: user.userId,
      nickname: user.nickname,
      content: record.fields.content,
      created_at: record.fields.created_at,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');
    const record = await base('REVIEW_COMMENT').find(commentId);
    if (record.fields.user_id !== user.userId) return NextResponse.json({ error: '내 댓글만 삭제할 수 있어요' }, { status: 403 });

    await base('REVIEW_COMMENT').destroy(commentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}