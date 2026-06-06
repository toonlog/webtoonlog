import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';
import { getUserFromRequest } from '../../../lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    const userId = searchParams.get('userId');

    const records = await base('COLLECTION_LIKE').select({
      filterByFormula: `{collection_id} = "${collectionId}"`,
    }).all();

    const count = records.length;
    const liked = userId ? records.some(r => r.fields.user_id === userId) : false;
    return NextResponse.json({ count, liked });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const { collectionId } = await request.json();
    const existing = await base('COLLECTION_LIKE').select({
      filterByFormula: `AND({collection_id} = "${collectionId}", {user_id} = "${user.userId}")`,
      maxRecords: 1,
    }).firstPage();

    if (existing.length > 0) {
      await base('COLLECTION_LIKE').destroy(existing[0].id);
      return NextResponse.json({ liked: false });
    } else {
      await base('COLLECTION_LIKE').create({
        collection_id: collectionId,
        user_id: user.userId,
        created_at: new Date().toISOString().split('T')[0],
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}