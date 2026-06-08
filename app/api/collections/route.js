import { NextResponse } from 'next/server';
import base from '../../lib/airtable';
import { getUserFromRequest } from '../../lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const webtoonId = searchParams.get('webtoonId');

    let filter = `{is_public} = 1`;
    if (userId) filter = `{user_id} = "${userId}"`;

    const records = await base('COLLECTION').select({
      filterByFormula: filter,
      sort: [{ field: 'created_at', direction: 'desc' }],
    }).all();

    let collections = records.map(r => ({
      id: r.id,
      name: r.fields.name || '이름 없음',
      description: r.fields.description || '',
      is_public: r.fields.is_public || false,
      user_id: r.fields.user_id || null,
      created_at: r.fields.created_at,
    }));

    if (webtoonId) {
      const itemRecords = await base('COLLECTION_ITEM').select({
        filterByFormula: `{webtoon_id} = "${webtoonId}"`,
      }).all();
      const collectionIds = new Set(itemRecords.map(r => r.fields.collection_id));
      const pubRecords = await base('COLLECTION').select({
        filterByFormula: `{is_public} = 1`,
      }).all();
      collections = pubRecords
        .filter(r => collectionIds.has(r.id))
        .map(r => ({
          id: r.id,
          name: r.fields.name || '이름 없음',
          description: r.fields.description || '',
          is_public: r.fields.is_public || false,
          user_id: r.fields.user_id || null,
          created_at: r.fields.created_at,
        }));
    }

    return NextResponse.json(collections);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const { name, description, is_public } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: '컬렉션 이름을 입력해주세요' }, { status: 400 });

   const record = await base('COLLECTION').create({
      name: name.trim(),
      description: description?.trim() || '',
      is_public: is_public ?? true,
      user_id: user.userId,
      created_at: new Date().toISOString().split('T')[0],
    });

    // 팔로워들에게 알람
    try {
      const { createNotification } = await import('../../lib/notification');
      const followRecords = await base('FOLLOW').select({
        filterByFormula: `{following_id} = "${user.userId}"`,
      }).all();
      await Promise.all(followRecords.map(f =>
        createNotification({
          userId: f.fields.follower_id,
          type: 'following_collection',
          actorId: user.userId,
          actorNickname: user.nickname,
          targetId: record.id,
          targetType: 'collection',
          webtoonId: '',
        })
      ));
    } catch (e) { console.error('알람 실패:', e.message); }

    return NextResponse.json({
      id: record.id,
      name: record.fields.name,
      description: record.fields.description,
      is_public: record.fields.is_public,
      user_id: record.fields.user_id,
      created_at: record.fields.created_at,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const { collectionId, name, description, is_public } = await request.json();
    const record = await base('COLLECTION').find(collectionId);
    if (record.fields.user_id !== user.userId) {
      return NextResponse.json({ error: '내 컬렉션만 수정할 수 있어요' }, { status: 403 });
    }

    await base('COLLECTION').update(collectionId, {
      name: name.trim(),
      description: description?.trim() || '',
      is_public: is_public ?? true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');

    const record = await base('COLLECTION').find(collectionId);
    if (record.fields.user_id !== user.userId) {
      return NextResponse.json({ error: '내 컬렉션만 삭제할 수 있어요' }, { status: 403 });
    }

    await base('COLLECTION').destroy(collectionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}