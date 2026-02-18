import { NextRequest, NextResponse } from 'next/server';
import { duplicatePrompt } from '@/lib/prompt-service';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const duplicated = await duplicatePrompt(id);
    return NextResponse.json(duplicated, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to duplicate prompt' }, { status: 400 });
  }
}
