import { NextRequest, NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/error-message';
import { createPrompt, listPrompts } from '@/lib/prompt-service';
import { promptSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const query = searchParams.get('query') ?? '';
    const category = searchParams.get('category') ?? '';
    const page = Number(searchParams.get('page') ?? '1');
    const pageSize = Number(searchParams.get('pageSize') ?? '30');
    const tags = searchParams.getAll('tag').filter(Boolean);

    const result = await listPrompts({ query, tags, category, page, pageSize });
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = promptSchema.parse(body);

    const prompt = await createPrompt({
      ...parsed,
      sample_image_url: parsed.sample_image_url || null
    });

    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 400 });
  }
}
