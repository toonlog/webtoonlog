import { NextResponse } from 'next/server';
import base from '../../lib/airtable';
import { getUserFromRequest } from '../../lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const webtoonId = searchParams.get('webtoonId');
    const userId = searchParams.get('userId');

    if (!webtoonId || !userId) return NextResponse.json({ status: null });

    const records = await base('READING_STATUS').select({
      filterByFormula: `AND({webtoon_id} = "${webtoonId}", {user_id} = "${userId}")`,
      maxRecords: 1,
    }).firstPage();

    if (records.length === 0) return NextResponse.json({ status: null });
    return NextResponse.json({ status: records[0].fields.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const { webtoonId, status } = await request.json();

    const existing = await base('READING_STATUS').select({
      filterByFormula: `AND({webtoon_id} = "${webtoonId}", {user_id} = "${user.userId}")`,
      maxRecords: 1,
    }).firstPage();

    if (existing.length > 0) {
      if (existing[0].fields.status === status) {
        await base('READING_STATUS').destroy(existing[0].id);
        return NextResponse.json({ status: null });
      }
      const updated = await base('READING_STATUS').update(existing[0].id, {
        status,
        updated_at: new Date().toISOString().split('T')[0],
      });
      return NextResponse.json({ status: updated.fields.status });
    }

    const record = await base('READING_STATUS').create({
      user_id: user.userId,
      nickname: user.nickname,
      webtoon_id: webtoonId,
      status,
      updated_at: new Date().toISOString().split('T')[0],
      webtoon: [webtoonId],
    });
    return NextResponse.json({ status: record.fields.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const webtoonId = searchParams.get('webtoonId');

    const records = await base('READING_STATUS').select({
      filterByFormula: `AND({webtoon_id} = "${webtoonId}", {user_id} = "${user.userId}")`,
      maxRecords: 1,
    }).firstPage();

    if (records.length === 0) return NextResponse.json({ error: '기록이 없어요' }, { status: 404 });

    await base('READING_STATUS').destroy(records[0].id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}