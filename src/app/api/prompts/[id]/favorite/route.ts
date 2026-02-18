import { NextRequest, NextResponse } from 'next/server';
import { toggleFavorite } from '@/lib/prompt-service';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updated = await toggleFavorite(id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 400 });
  }
}
