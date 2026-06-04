import { NextResponse } from 'next/server';
import base from '../../lib/airtable';
import { getUserFromRequest } from '../../lib/auth';

// 내 컬렉션 목록 or 전체 공개 컬렉션
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let filter = `{is_public} = 1`;
    if (userId) filter = `{user_id} = "${userId}"`;

    const records = await base('COLLECTION').select({
      filterByFormula: filter,
      sort: [{ field: 'created_at', direction: 'desc' }],
    }).all();

    const collections = records.map(r => ({
      id: r.id,
      name: r.fields.name || '이름 없음',
      description: r.fields.description || '',
      is_public: r.fields.is_public || false,
      user_id: r.fields.user_id || null,
      created_at: r.fields.created_at,
    }));

    return NextResponse.json(collections);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 컬렉션 생성
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

    return NextResponse.json({
      id: record.id,
      name: record.fields.name,
      description: record.fields.description,
      is_public: record.fields.is_public,
      user_id: record.fields.user_id,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 컬렉션 삭제
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