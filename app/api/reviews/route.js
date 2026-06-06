import { NextResponse } from 'next/server';
import base from '../../lib/airtable';
import { getUserFromRequest } from '../../lib/auth';

async function updateWebtoonRating(webtoonId) {
  try {
const reviews = await base('REVIEW').select({
      filterByFormula: `{webtoon_id} = "${webtoonId}"`,
    }).all();
    const ratedReviews = reviews.filter(r => !r.fields.is_wishlist);
    const count = ratedReviews.length;
    const avg = count > 0
      ? Math.round((ratedReviews.reduce((s, r) => s + (r.fields.rating || 0), 0) / count) * 10) / 10
      : 0;
    await base('WEBTOON').update(webtoonId, { avg_rating: avg, review_count: count });
  } catch (e) { console.error('rating update fail', e); }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const webtoonId = searchParams.get('webtoonId');

    const records = await base('REVIEW').select({
    filterByFormula: `FIND("${webtoonId}", {webtoon_id})`,
      sort: [{ field: 'created_at', direction: 'desc' }],
    }).all();

    const userIds = [...new Set(records.map(r => r.fields.user_id).filter(Boolean))];
    const userMap = {};
    await Promise.all(userIds.map(async (uid) => {
      try {
        const u = await base('USER').find(uid);
        userMap[uid] = u.fields.profile_image || null;
      } catch { userMap[uid] = null; }
    }));

    const statusRecords = await base('READING_STATUS').select({
      filterByFormula: `{webtoon_id} = "${webtoonId}"`,
    }).all();
    const statusMap = {};
    statusRecords.forEach(s => { statusMap[s.fields.user_id] = s.fields.status; });

    return NextResponse.json(records.map(r => ({
      id: r.id,
      nickname: r.fields.nickname || '익명',
      userId: r.fields.user_id || null,
      profileImage: userMap[r.fields.user_id] || null,
      rating: r.fields.rating,
      content: r.fields.content,
      tags: r.fields.tags || '',
      created_at: r.fields.created_at,
is_public: r.fields.is_public ?? true,
      is_wishlist: r.fields.is_wishlist || false,
      readStatus: statusMap[r.fields.user_id] || null,
    })));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

  const { webtoonId, rating, content, tags, is_wishlist } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: '리뷰 내용을 입력해주세요' }, { status: 400 });

    const existing = await base('REVIEW').select({
      filterByFormula: `AND({webtoon_id} = "${webtoonId}", {user_id} = "${user.userId}")`,
      maxRecords: 1,
    }).firstPage();
    if (existing.length > 0) return NextResponse.json({ error: '이미 리뷰를 작성했어요. 수정해주세요!' }, { status: 409 });

const record = await base('REVIEW').create({
      nickname: user.nickname,
      user_id: user.userId,
      webtoon_id: webtoonId,
      rating: is_wishlist ? 0 : Number(rating),
      content: content.trim(),
      tags: tags ? tags.trim() : '',
      is_public: true,
      is_wishlist: is_wishlist || false,
      created_at: new Date().toISOString().split('T')[0],
      webtoon: [webtoonId],
    });

await updateWebtoonRating(webtoonId);
    return NextResponse.json({
      id: record.id,
      nickname: user.nickname,
      userId: user.userId,
      rating: record.fields.rating,
      content: record.fields.content,
      tags: record.fields.tags || '',
      is_public: record.fields.is_public ?? true,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const { reviewId, rating, content, is_public, tags } = await request.json();
    const record = await base('REVIEW').find(reviewId);
    if (record.fields.user_id !== user.userId) return NextResponse.json({ error: '내 리뷰만 수정할 수 있어요' }, { status: 403 });

    const updateFields = {};
    if (rating !== undefined) updateFields.rating = Number(rating);
    if (content !== undefined) updateFields.content = content.trim();
    if (is_public !== undefined) updateFields.is_public = is_public;
    if (tags !== undefined) updateFields.tags = tags.trim();

    const updated = await base('REVIEW').update(reviewId, updateFields);
    await updateWebtoonRating(record.fields.webtoon_id);

    return NextResponse.json({
      id: updated.id,
      nickname: updated.fields.nickname,
      rating: updated.fields.rating,
      content: updated.fields.content,
      tags: updated.fields.tags || '',
      is_public: updated.fields.is_public ?? true,
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
    await updateWebtoonRating(webtoonId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}