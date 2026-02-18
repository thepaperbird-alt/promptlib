import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/error-message';
import { listCategories } from '@/lib/prompt-service';

export async function GET() {
  try {
    const categories = await listCategories();
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to fetch categories') },
      { status: 500 }
    );
  }
}
