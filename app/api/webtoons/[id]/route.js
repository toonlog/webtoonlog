import { NextResponse } from 'next/server';
import base from '../../../lib/airtable';

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const record = await base('WEBTOON').find(id);
    return NextResponse.json({ id: record.id, ...record.fields });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
