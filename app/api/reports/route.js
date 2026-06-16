import { NextResponse } from 'next/server';
import base from '../../lib/airtable';
import { getUserFromRequest } from '../../lib/auth';

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const body = await request.json();
    const { webtoonId, webtoonTitle, type, content } = body;
    if (!webtoonId || !content?.trim()) {
      return NextResponse.json({ error: '내용을 입력해주세요' }, { status: 400 });
    }

    await base('REPORT').create({
      webtoon_id: webtoonId,
      webtoon_title: webtoonTitle || '',
      user_id: user.userId || user.id || '',
      nickname: user.nickname || '',
      type: type || '기타',
      content: content.trim(),
      status: '대기',
      created_at: new Date().toISOString().split('T')[0],
    }, { typecast: true });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}