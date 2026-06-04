import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';
import { hashPassword, signToken } from '../../../lib/auth';

export async function POST(request) {
  try {
    const { nickname, password } = await request.json();
    if (!nickname || !password) return NextResponse.json({ error: '닉네임과 비밀번호를 입력해주세요' }, { status: 400 });
    if (password.length < 4) return NextResponse.json({ error: '비밀번호는 4자 이상이어야 해요' }, { status: 400 });

    const existing = await base('USER').select({
      filterByFormula: `{nickname} = "${nickname}"`, maxRecords: 1,
    }).firstPage();
    if (existing.length > 0) return NextResponse.json({ error: '이미 사용 중인 닉네임이에요' }, { status: 409 });

    const record = await base('USER').create({
      nickname,
      password_hash: hashPassword(password),
      created_at: new Date().toISOString().split('T')[0],
    });

    const token = signToken({ userId: record.id, nickname });
    return NextResponse.json({ token, nickname, userId: record.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}