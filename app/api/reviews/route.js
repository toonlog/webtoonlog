import { NextResponse } from 'next/server';
import base from '../../lib/airtable';
import { getUserFromRequest } from '../../lib/auth';

async function updateWebtoonStats(webtoonId) {
  const records = await base('REVIEW').select({
    filterByFormula: `{webtoon_id} = "${webtoonId}"`,
  }).all();
  const count = records.length;
  const avg = count > 0
    ? records.reduce((sum, r) => sum + (r.fields.rating || 0), 0) / count
    : 0;
  await base('WEBTOON').update(webtoonId, {
    avg_rating: Math.round(avg * 10) / 10,
    review_count: count,
  });
}

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
    const webtoonId = searchParams.get('webtoonId');
    const records = await base('REVIEW').select({
      filterByFormula: `{webtoon_id} = "${webtoonId}"`,
      sort: [{ field: 'created_at', direction: 'desc' }],
    }).all();
    return NextResponse.json(records.map(r => ({
      id: r.id,
      nickname: r.fields.nickname || '익명',
      userId: r.fields.user_id || null,
      rating: r.fields.rating,
      content: r.fields.content,
      created_at: r.fields.created_at,
      like_count: r.fields.like_count || 0,
      liked_by: r.fields.liked_by || '',
      profile_image: r.fields.profile_image || '',
      tags: r.fields.tags ? r.fields.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    })));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const { webtoonId, rating, content, tags } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: '리뷰 내용을 입력해주세요' }, { status: 400 });

    const existing = await base('REVIEW').select({
      filterByFormula: `AND({webtoon_id} = "${webtoonId}", {user_id} = "${user.userId}")`,
      maxRecords: 1,
    }).firstPage();
    if (existing.length > 0) return NextResponse.json({ error: '이미 리뷰를 작성했어요. 수정해주세요!' }, { status: 409 });

    const profileImage = await getUserProfileImage(user.userId);
    const tagsStr = Array.isArray(tags) ? tags.join(',') : '';

    const record = await base('REVIEW').create({
      nickname: user.nickname,
      user_id: user.userId,
      webtoon_id: webtoonId,
      rating: Number(rating),
      content: content.trim(),
      is_spoiler: false,
      created_at: new Date().toISOString().split('T')[0],
      webtoon: [webtoonId],
      like_count: 0,
      liked_by: '',
      profile_image: profileImage,
      tags: tagsStr,
    });

    await updateWebtoonStats(webtoonId);

    return NextResponse.json({
      id: record.id,
      nickname: user.nickname,
      userId: user.userId,
      rating: record.fields.rating,
      content: record.fields.content,
      like_count: 0,
      liked_by: '',
      profile_image: profileImage,
      tags: tags || [],
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const { reviewId, rating, content, tags } = await request.json();
    const record = await base('REVIEW').find(reviewId);
    if (record.fields.user_id !== user.userId) return NextResponse.json({ error: '내 리뷰만 수정할 수 있어요' }, { status: 403 });

    const tagsStr = Array.isArray(tags) ? tags.join(',') : '';

    const updated = await base('REVIEW').update(reviewId, {
      rating: Number(rating),
      content: content.trim(),
      tags: tagsStr,
    });

    await updateWebtoonStats(record.fields.webtoon_id);

    return NextResponse.json({
      id: updated.id,
      nickname: updated.fields.nickname,
      rating: updated.fields.rating,
      content: updated.fields.content,
      tags: updated.fields.tags ? updated.fields.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
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
    const reviewId = searchParams.get('reviewId');
    const record = await base('REVIEW').find(reviewId);
    if (record.fields.user_id !== user.userId) return NextResponse.json({ error: '내 리뷰만 삭제할 수 있어요' }, { status: 403 });

    const webtoonId = record.fields.webtoon_id;
    await base('REVIEW').destroy(reviewId);
    await updateWebtoonStats(webtoonId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}