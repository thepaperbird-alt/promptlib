import type { Prompt, PromptCreateInput, PromptListResponse, PromptUpdateInput } from '@/types/prompt';

interface ListArgs {
  query: string;
  tags: string[];
  category: string;
  page: number;
  pageSize: number;
}

function makeQuery(args: ListArgs): string {
  const params = new URLSearchParams();
  if (args.query) params.set('query', args.query);
  if (args.category) params.set('category', args.category);
  params.set('page', String(args.page));
  params.set('pageSize', String(args.pageSize));
  args.tags.forEach((tag) => params.append('tag', tag));
  return params.toString();
}

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.error === 'string' && data.error.length > 0) return data.error;
  } catch {
    // Ignore parse failures and use fallback.
  }
  return fallback;
}

export async function fetchPrompts(args: ListArgs): Promise<PromptListResponse> {
  const res = await fetch(`/api/prompts?${makeQuery(args)}`);
  if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to fetch prompts'));
  return res.json();
}

export async function fetchTags(): Promise<string[]> {
  const res = await fetch('/api/tags');
  if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to fetch tags'));
  const data = await res.json();
  return data.data;
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to fetch categories'));
  const data = await res.json();
  return data.data;
}

export async function createPrompt(input: PromptCreateInput): Promise<Prompt> {
  const res = await fetch('/api/prompts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to create prompt'));
  return res.json();
}

export async function updatePrompt(id: string, input: PromptUpdateInput): Promise<Prompt> {
  const res = await fetch(`/api/prompts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to update prompt'));
  return res.json();
}

export async function removePrompt(id: string): Promise<void> {
  const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to delete prompt'));
}

export async function duplicatePrompt(id: string): Promise<Prompt> {
  const res = await fetch(`/api/prompts/${id}/duplicate`, { method: 'POST' });
  if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to duplicate prompt'));
  return res.json();
}

export async function toggleFavorite(id: string): Promise<Prompt> {
  const res = await fetch(`/api/prompts/${id}/favorite`, { method: 'POST' });
  if (!res.ok) throw new Error(await extractErrorMessage(res, 'Failed to toggle favorite'));
  return res.json();
}
