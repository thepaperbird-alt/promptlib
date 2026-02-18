import { NextResponse } from 'next/server';
import { listTags } from '@/lib/prompt-service';

export async function GET() {
  try {
    const tags = await listTags();
    return NextResponse.json({ data: tags });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
