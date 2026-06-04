import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';
import { verifyPassword, signToken } from '../../../lib/auth';

export async function POST(request) {
  try {
    const { nickname, password } = await request.json();
    if (!nickname || !password) return NextResponse.json({ error: '닉네임과 비밀번호를 입력해주세요' }, { status: 400 });

    const records = await base('USER').select({
      filterByFormula: `{nickname} = "${nickname}"`, maxRecords: 1,
    }).firstPage();
    if (records.length === 0) return NextResponse.json({ error: '닉네임 또는 비밀번호가 틀렸어요' }, { status: 401 });

    const user = records[0];
    if (!verifyPassword(password, user.fields.password_hash)) {
      return NextResponse.json({ error: '닉네임 또는 비밀번호가 틀렸어요' }, { status: 401 });
    }

    const token = signToken({ userId: user.id, nickname });
    return NextResponse.json({ token, nickname, userId: user.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}