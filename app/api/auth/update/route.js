import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';
import { getUserFromRequest, signToken } from '../../../lib/auth';

export async function PATCH(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });

    const { nickname, profile_image } = await request.json();

    const updateFields = {};

    if (nickname !== undefined) {
      if (!nickname.trim()) return NextResponse.json({ error: '닉네임을 입력해주세요' }, { status: 400 });
      const existing = await base('USER').select({
        filterByFormula: `{nickname} = "${nickname.trim()}"`,
        maxRecords: 1,
      }).firstPage();
      if (existing.length > 0 && existing[0].id !== user.userId) {
        return NextResponse.json({ error: '이미 사용 중인 닉네임이에요' }, { status: 409 });
      }
      updateFields.nickname = nickname.trim();
    }

    if (profile_image !== undefined) {
      updateFields.profile_image = profile_image;
    }

    await base('USER').update(user.userId, updateFields);

    const newNickname = updateFields.nickname || user.nickname;
    const token = signToken({ userId: user.userId, nickname: newNickname });
    return NextResponse.json({ token, nickname: newNickname });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}