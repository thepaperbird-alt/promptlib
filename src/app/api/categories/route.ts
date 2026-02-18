import { NextResponse } from 'next/server';
import { listCategories } from '@/lib/prompt-service';

export async function GET() {
  try {
    const categories = await listCategories();
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
