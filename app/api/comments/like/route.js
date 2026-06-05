import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';
import { getUserFromRequest } from '../../../lib/auth';

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const { commentId } = await request.json();
    const record = await base('COMMENT').find(commentId);

    const likedBy = (record.fields.liked_by || '').split(',').filter(Boolean);
    const alreadyLiked = likedBy.includes(user.userId);

    let newLikedBy, newCount;
    if (alreadyLiked) {
      newLikedBy = likedBy.filter(id => id !== user.userId).join(',');
      newCount = Math.max(0, (record.fields.like_count || 0) - 1);
    } else {
      newLikedBy = [...likedBy, user.userId].join(',');
      newCount = (record.fields.like_count || 0) + 1;
    }

    await base('COMMENT').update(commentId, {
      liked_by: newLikedBy,
      like_count: newCount,
    });

    return NextResponse.json({ liked: !alreadyLiked, like_count: newCount });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}