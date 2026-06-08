import { NextResponse } from 'next/server';
import base from '../../lib/airtable';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json([]);

    const records = await base('NOTIFICATION').select({
      filterByFormula: `{user_id} = "${userId}"`,
      sort: [{ field: 'created_at', direction: 'desc' }],
      maxRecords: 50,
    }).all();

    return NextResponse.json(records.map(r => ({ id: r.id, ...r.fields })));
  } catch (e) {
    return NextResponse.json([]);
  }
}

export async function PATCH(request) {
  try {
    const { notificationId } = await request.json();
    if (!notificationId) return NextResponse.json({ error: 'id 없음' }, { status: 400 });
    await base('NOTIFICATION').update(notificationId, { is_read: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}