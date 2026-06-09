import base from './airtable';

export async function createNotification({ userId, type, actorId, actorNickname, targetId, targetType, webtoonId }) {
  if (!userId || userId === actorId) return;
  try {
    await base('NOTIFICATION').create({
      user_id: userId,
      type,
      actor_id: actorId || '',
      actor_nickname: actorNickname || '',
      target_id: targetId || '',
      target_type: targetType || '',
      webtoon_id: webtoonId || '',
      is_read: false,
      created_at: new Date().toISOString().split('T')[0],
    });
  } catch (e) {
    console.error('알람 생성 실패:', e.message);
  }
}