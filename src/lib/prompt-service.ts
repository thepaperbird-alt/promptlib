import { supabaseAdmin } from '@/lib/supabase-client';
import type {
  Prompt,
  PromptCreateInput,
  PromptFilters,
  PromptListResponse,
  PromptUpdateInput
} from '@/types/prompt';

function cleanString(value?: string): string {
  return (value ?? '').trim();
}

const META_BATCH_SIZE = 1000;

async function fetchAllPromptMetaRows<T extends 'tags' | 'category'>(
  column: T
): Promise<Array<{ tags?: string[]; category?: string }>> {
  const rows: Array<{ tags?: string[]; category?: string }> = [];
  let from = 0;

  while (true) {
    const to = from + META_BATCH_SIZE - 1;
    const { data, error } = await supabaseAdmin
      .from('prompts')
      .select(column)
      .range(from, to);

    if (error) throw error;

    const chunk = (data ?? []) as Array<{ tags?: string[]; category?: string }>;
    rows.push(...chunk);

    if (chunk.length < META_BATCH_SIZE) break;
    from += META_BATCH_SIZE;
  }

  return rows;
}

export async function listPrompts(filters: PromptFilters): Promise<PromptListResponse> {
  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = Math.min(Math.max(filters.pageSize ?? 30, 1), 100);

  const { data, error } = await supabaseAdmin.rpc('search_prompts', {
    q: cleanString(filters.query),
    tags_filter: filters.tags ?? [],
    category_filter: cleanString(filters.category),
    page_num: page,
    page_size: pageSize
  });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as (Prompt & { total_count: number })[];

  return {
    data: rows.map((row) => {
      const { total_count, ...rest } = row;
      void total_count;
      return rest;
    }),
    count: rows[0]?.total_count ?? 0,
    page,
    pageSize
  };
}

export async function getPrompt(id: string): Promise<Prompt | null> {
  const { data, error } = await supabaseAdmin.from('prompts').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as Prompt;
}

export async function createPrompt(input: PromptCreateInput): Promise<Prompt> {
  const payload = {
    ...input,
    sample_image_url: input.sample_image_url?.trim() || null,
    version: input.version ?? 1
  };

  const { data, error } = await supabaseAdmin.from('prompts').insert(payload).select('*').single();

  if (error) throw error;
  return data as Prompt;
}

export async function updatePrompt(id: string, input: PromptUpdateInput): Promise<Prompt> {
  const { data, error } = await supabaseAdmin
    .from('prompts')
    .update({
      ...input,
      sample_image_url:
        input.sample_image_url == null ? input.sample_image_url : input.sample_image_url.trim() || null
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Prompt;
}

export async function deletePrompt(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('prompts').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicatePrompt(id: string): Promise<Prompt> {
  const original = await getPrompt(id);
  if (!original) {
    throw new Error('Prompt not found');
  }

  const { data, error } = await supabaseAdmin
    .from('prompts')
    .insert({
      title: `${original.title} (Copy)`,
      prompt_text: original.prompt_text,
      model: original.model,
      tags: original.tags,
      category: original.category,
      sample_image_url: original.sample_image_url,
      version: original.version + 1,
      favorite: false
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Prompt;
}

export async function toggleFavorite(id: string): Promise<Prompt> {
  const prompt = await getPrompt(id);
  if (!prompt) {
    throw new Error('Prompt not found');
  }

  return updatePrompt(id, { favorite: !prompt.favorite });
}

export async function listTags(): Promise<string[]> {
  const data = await fetchAllPromptMetaRows('tags');

  const tagSet = new Set<string>();
  for (const row of data ?? []) {
    for (const tag of row.tags ?? []) {
      if (tag) tagSet.add(tag);
    }
  }

  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
}

export async function listCategories(): Promise<string[]> {
  const data = await fetchAllPromptMetaRows('category');

  const categories = (data ?? [])
    .map((x) => x.category)
    .filter((value): value is string => typeof value === 'string' && value.length > 0);

  return Array.from(new Set(categories)).sort((a, b) => a.localeCompare(b));
}
