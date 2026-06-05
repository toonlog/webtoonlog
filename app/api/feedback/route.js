import { NextResponse } from 'next/server';
import base from '../../lib/airtable';
import { getUserFromRequest } from '../../lib/auth';

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    const { content } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: '내용을 입력해주세요' }, { status: 400 });

    await base('FEEDBACK').create({
      content: content.trim(),
      nickname: user?.nickname || '익명',
      created_at: new Date().toISOString().split('T')[0],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}