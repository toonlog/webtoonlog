import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';
import { getUserFromRequest } from '../../../lib/auth';

// 컬렉션 아이템 목록
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');

    const records = await base('COLLECTION_ITEM').select({
      filterByFormula: `{collection_id} = "${collectionId}"`,
      sort: [{ field: 'order', direction: 'asc' }],
    }).all();

    const webtoonIds = records.map(r => r.fields.webtoon_id).filter(Boolean);
    const webtoonMap = {};
    await Promise.all(webtoonIds.map(async (wId) => {
      try {
        const rec = await base('WEBTOON').find(wId);
        webtoonMap[wId] = { title: rec.fields.title, author: rec.fields.author, platform: rec.fields.platform, thumbnailUrl: rec.fields.thumbnailUrl };
      } catch { webtoonMap[wId] = { title: wId }; }
    }));

    const items = records.map(r => ({
      id: r.id,
      webtoon_id: r.fields.webtoon_id,
      order: r.fields.order,
      ...webtoonMap[r.fields.webtoon_id],
    }));

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 컬렉션에 웹툰 추가
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const { collectionId, webtoonId } = await request.json();

    // 내 컬렉션인지 확인
    const collection = await base('COLLECTION').find(collectionId);
    if (collection.fields.user_id !== user.userId) {
      return NextResponse.json({ error: '내 컬렉션에만 추가할 수 있어요' }, { status: 403 });
    }

    // 이미 있는지 확인
    const existing = await base('COLLECTION_ITEM').select({
      filterByFormula: `AND({collection_id} = "${collectionId}", {webtoon_id} = "${webtoonId}")`,
      maxRecords: 1,
    }).firstPage();
    if (existing.length > 0) return NextResponse.json({ error: '이미 추가된 웹툰이에요' }, { status: 409 });

    const record = await base('COLLECTION_ITEM').create({
      collection_id: collectionId,
      webtoon_id: webtoonId,
      collection: [collectionId],
      webtoon: [webtoonId],
    });

    return NextResponse.json({ id: record.id, webtoon_id: webtoonId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 컬렉션에서 웹툰 삭제
export async function DELETE(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    await base('COLLECTION_ITEM').destroy(itemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}