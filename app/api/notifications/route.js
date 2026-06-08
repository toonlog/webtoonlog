import { NextResponse } from 'next/server';
import base from '../../lib/airtable';
import { verifyToken } from '../../lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json([], { status: 200 });

    const records = await base('NOTIFICATION').select({
      filterByFormula: `{user_id} = "${userId}"`,
      sort: [{ field: 'created_at', direction: 'desc' }],
      maxRecords: 50,
    }).all();

    const notifications = records.map(r => ({ id: r.id, ...r.fields }));
    return NextResponse.json(notifications);
  } catch (e) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function PATCH(request) {
  try {
    const auth = verifyToken(request);
    if (!auth) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

    const { notificationId } = await request.json();
    await base('NOTIFICATION').update(notificationId, { is_read: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// 알람 생성 헬퍼 (다른 route에서 import해서 사용)
export async function createNotification({ userId, type, actorId, actorNickname, targetId, targetType, webtoonId }) {
  if (userId === actorId) return; // 자기 자신 알람 제외
  await base('NOTIFICATION').create({
    user_id: userId,
    type,
    actor_id: actorId,
    actor_nickname: actorNickname,
    target_id: targetId || '',
    target_type: targetType || '',
    webtoon_id: webtoonId || '',
    is_read: false,
    created_at: new Date().toISOString().split('T')[0],
  });
}