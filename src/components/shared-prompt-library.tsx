'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import { Grid2X2, List, Search, Copy, X } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { fetchCategories, fetchPrompts, fetchTags } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Prompt } from '@/types/prompt';

const PAGE_SIZE = 30;
const NOTE_STYLES = [
  {
    card: 'bg-[#fff15a]',
    tab: 'bg-[#fff15a]',
    accent: 'text-[#25211d]'
  },
  {
    card: 'bg-[#ff6fb5]',
    tab: 'bg-[#ff6fb5]',
    accent: 'text-[#2e1824]'
  },
  {
    card: 'bg-[#9ff1f1]',
    tab: 'bg-[#9ff1f1]',
    accent: 'text-[#173033]'
  },
  {
    card: 'bg-[#fff7f1]',
    tab: 'bg-[#fff7f1]',
    accent: 'text-[#2f2722]'
  }
] as const;

function SharedPromptCard({
  prompt,
  index,
  view,
  onClick
}: {
  prompt: Prompt;
  index: number;
  view: 'grid' | 'list';
  onClick: (prompt: Prompt) => void;
}) {
  const style = NOTE_STYLES[index % NOTE_STYLES.length];
  const rotation = ['-rotate-[1.4deg]', 'rotate-[1.1deg]', '-rotate-[0.6deg]', 'rotate-[1.8deg]'][
    index % 4
  ];

  return (
    <button
      type="button"
      onClick={() => onClick(prompt)}
      className={cn(
        'shared-note rounded-[22px] px-5 pb-5 pt-8 text-left transition-transform duration-150 hover:-translate-y-1',
        style.card,
        style.accent,
        rotation,
        view === 'list' && 'w-full'
      )}
    >
      <div
        className={cn(
          'absolute left-6 top-[-10px] rounded-t-[12px] border border-black/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
          style.tab
        )}
      >
        {prompt.category}
      </div>

      <div className="flex items-start justify-between gap-4">
        <h3 className="pr-2 text-xl leading-tight">{prompt.title}</h3>
        <span className="shrink-0 rounded-full border border-black/10 px-2 py-1 text-[11px] uppercase tracking-[0.12em]">
          v{prompt.version}
        </span>
      </div>

      <p className="mt-4 line-clamp-4 text-sm leading-6 text-black/70">{prompt.prompt_text}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {prompt.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-black/10 bg-white/45 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em]"
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}

function SharedPromptDetail({
  open,
  prompt,
  onOpenChange
}: {
  open: boolean;
  prompt: Prompt | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!prompt) return null;

  async function handleCopy() {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt.prompt_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-white/70 backdrop-blur-sm" />
        <Dialog.Content className="shared-paper fixed left-1/2 top-1/2 h-[85vh] w-[94vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[28px] border border-black/10 p-6 text-[#1e1a18] md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex rounded-full bg-[#fff15a] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#2b251e]">
                {prompt.category}
              </div>
              <h2 className="mt-4 text-3xl leading-tight md:text-5xl">{prompt.title}</h2>
              <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-black/55">
                <span>{prompt.model}</span>
                <span>v{prompt.version}</span>
              </div>
            </div>

            <Dialog.Close asChild>
              <button type="button" className="rounded-full border border-black/10 p-2 text-black/60 hover:text-black">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-8 space-y-6">
            <section className="rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_14px_35px_rgba(0,0,0,0.06)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-xs uppercase tracking-[0.22em] text-black/45">Prompt</h3>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#9ff1f1] px-3 py-1.5 text-xs uppercase tracking-[0.14em]"
                >
                  <Copy size={12} />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm leading-7 text-black/80">{prompt.prompt_text}</pre>
            </section>

            <section className="rounded-[24px] border border-black/10 bg-[#fff7f1] p-5">
              <h3 className="text-xs uppercase tracking-[0.22em] text-black/45">Tags</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {prompt.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs uppercase tracking-[0.12em]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {prompt.sample_image_url && (
              <section className="rounded-[24px] border border-black/10 bg-[#ffe8f3] p-5">
                <h3 className="text-xs uppercase tracking-[0.22em] text-black/45">Sample Image</h3>
                <div className="relative mt-4 aspect-video overflow-hidden rounded-[18px] border border-black/10 bg-white">
                  <Image
                    src={prompt.sample_image_url}
                    alt={prompt.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 900px"
                  />
                </div>
              </section>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function SharedPromptLibrary() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [loadedTags, loadedCategories] = await Promise.all([fetchTags(), fetchCategories()]);
        setTags(loadedTags);
        setCategories(loadedCategories);
      } catch (loadError) {
        console.error(loadError);
        setError(loadError instanceof Error ? loadError.message : 'Failed to load filters');
      }
    }

    void loadMeta();
  }, []);

  useEffect(() => {
    async function loadPrompts() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchPrompts({
          query: deferredQuery,
          tags: selectedTags,
          category: selectedCategory,
          page,
          pageSize: PAGE_SIZE
        });
        setPrompts(result.data);
        setTotalCount(result.count);
      } catch (loadError) {
        console.error(loadError);
        setError(loadError instanceof Error ? loadError.message : 'Failed to load prompts');
      } finally {
        setLoading(false);
      }
    }

    void loadPrompts();
  }, [deferredQuery, selectedTags, selectedCategory, page]);

  const pageCount = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);

  function toggleTag(tag: string) {
    setPage(1);
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  }

  function resetFilters() {
    setQuery('');
    setSelectedTags([]);
    setSelectedCategory('');
    setPage(1);
  }

  const featuredTags = useMemo(() => tags.slice(0, 18), [tags]);

  return (
    <main className="shared-board min-h-screen text-[#1e1a18]">
      <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-8 md:py-8">
        <header className="rounded-[30px] border border-black/10 bg-white/70 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-sm md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex rounded-full bg-[#fff15a] px-3 py-1 text-[11px] uppercase tracking-[0.2em]">
                Shared View
              </div>
              <h1 className="mt-4 max-w-4xl text-4xl leading-none md:text-7xl">Prompt Shelf</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-black/65 md:text-base">
                by Mahesh Ravi
              </p>
            </div>

            <div className="flex w-full max-w-xl flex-col gap-3">
              <div className="relative rounded-[24px] border border-black/10 bg-[#fff7f1] px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                <input
                  value={query}
                  onChange={(event) => {
                    setPage(1);
                    setQuery(event.target.value);
                  }}
                  placeholder="Search titles and prompt text"
                  className="w-full bg-transparent pl-7 text-base placeholder:text-black/35"
                />
              </div>

              <div className="flex items-center justify-between rounded-[22px] border border-black/10 bg-white px-4 py-3 text-xs uppercase tracking-[0.16em] text-black/45">
                <span>{totalCount} prompts</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={cn(
                      'rounded-full border px-3 py-1.5',
                      view === 'grid' ? 'border-black/20 bg-[#9ff1f1] text-black' : 'border-black/10'
                    )}
                    onClick={() => setView('grid')}
                  >
                    <Grid2X2 size={14} />
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'rounded-full border px-3 py-1.5',
                      view === 'list' ? 'border-black/20 bg-[#ffdf70] text-black' : 'border-black/10'
                    )}
                    onClick={() => setView('list')}
                  >
                    <List size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <section className="shared-note rounded-[24px] bg-[#fff15a] p-5 pt-8 text-[#201d18]">
              <div className="absolute left-6 top-[-10px] rounded-t-[12px] border border-black/10 bg-[#fff15a] px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                Categories
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('');
                    setPage(1);
                  }}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.12em]',
                    selectedCategory === '' ? 'border-black/20 bg-white' : 'border-black/10 bg-transparent'
                  )}
                >
                  All
                </button>
                {categories.map((category, index) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category);
                      setPage(1);
                    }}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.12em]',
                      selectedCategory === category
                        ? 'border-black/20 bg-white'
                        : index % 2 === 0
                          ? 'border-black/10 bg-[#fff7f1]'
                          : 'border-black/10 bg-[#ffffff80]'
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </section>

            <section className="shared-note rounded-[24px] bg-[#9ff1f1] p-5 pt-8 text-[#183033]">
              <div className="absolute left-6 top-[-10px] rounded-t-[12px] border border-black/10 bg-[#9ff1f1] px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                Tags
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                {featuredTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.12em]',
                      selectedTags.includes(tag)
                        ? 'border-black/20 bg-white'
                        : 'border-black/10 bg-[#ffffff80]'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            <button
              type="button"
              onClick={resetFilters}
              className="w-full rounded-[22px] border border-black/10 bg-[#ffe8f3] px-4 py-3 text-sm uppercase tracking-[0.16em] text-[#3b2430]"
            >
              Reset board
            </button>
          </aside>

          <section>
            {error && (
              <div className="rounded-[22px] border border-[#f2a6c4] bg-[#fff1f7] px-4 py-3 text-sm text-[#8b365b]">
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-[28px] border border-black/10 bg-white px-6 py-10 text-sm text-black/50">
                Loading prompts...
              </div>
            ) : (
              <div className={cn(view === 'grid' ? 'grid gap-6 md:grid-cols-2 xl:grid-cols-3' : 'space-y-5')}>
                {prompts.map((prompt, index) => (
                  <SharedPromptCard
                    key={prompt.id}
                    prompt={prompt}
                    index={index}
                    view={view}
                    onClick={(picked) => {
                      setSelectedPrompt(picked);
                      setDetailOpen(true);
                    }}
                  />
                ))}
              </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm disabled:opacity-35"
              >
                Prev
              </button>
              <span className="rounded-full bg-[#fff7f1] px-4 py-2 text-xs uppercase tracking-[0.14em] text-black/55">
                Page {page} / {pageCount}
              </span>
              <button
                type="button"
                disabled={page >= pageCount}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm disabled:opacity-35"
              >
                Next
              </button>
            </div>
          </section>
        </div>
      </div>

      <SharedPromptDetail open={detailOpen} prompt={selectedPrompt} onOpenChange={setDetailOpen} />
    </main>
  );
}
