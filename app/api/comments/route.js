import { NextResponse } from 'next/server';
import base from '../../lib/airtable';
import { getUserFromRequest } from '../../lib/auth';

async function getUserProfileImage(userId) {
  try {
    const records = await base('USER').select({
      filterByFormula: `RECORD_ID() = "${userId}"`,
      maxRecords: 1,
    }).firstPage();
    return records[0]?.fields.profile_image || '';
  } catch { return ''; }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    const records = await base('COMMENT').select({
      filterByFormula: `{review_id} = "${reviewId}"`,
      sort: [{ field: 'created_at', direction: 'asc' }],
    }).all();

    return NextResponse.json(records.map(r => ({
      id: r.id,
      content: r.fields.content,
      user_id: r.fields.user_id,
      nickname: r.fields.nickname,
      review_id: r.fields.review_id,
      created_at: r.fields.created_at,
      like_count: r.fields.like_count || 0,
      liked_by: r.fields.liked_by || '',
      profile_image: r.fields.profile_image || '',
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

    const profileImage = await getUserProfileImage(user.userId);

    const record = await base('COMMENT').create({
      content: content.trim(),
      user_id: user.userId,
      nickname: user.nickname,
      review_id: reviewId,
      created_at: new Date().toISOString().split('T')[0],
      like_count: 0,
      liked_by: '',
      profile_image: profileImage,
    });

    return NextResponse.json({
      id: record.id,
      content: record.fields.content,
      user_id: record.fields.user_id,
      nickname: record.fields.nickname,
      created_at: record.fields.created_at,
      like_count: 0,
      liked_by: '',
      profile_image: profileImage,
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

    const record = await base('COMMENT').find(commentId);
    if (record.fields.user_id !== user.userId) {
      return NextResponse.json({ error: '내 댓글만 삭제할 수 있어요' }, { status: 403 });
    }

    await base('COMMENT').destroy(commentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}