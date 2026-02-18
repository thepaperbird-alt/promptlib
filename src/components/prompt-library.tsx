'use client';

import { useEffect, useMemo, useState } from 'react';
import { Grid2X2, List, Plus, Search } from 'lucide-react';
import { Button } from '@/components/button';
import { PromptCard } from '@/components/prompt-card';
import { PromptDetailDialog } from '@/components/prompt-detail-dialog';
import { PromptFormDialog } from '@/components/prompt-form-dialog';
import { SidebarFilters } from '@/components/sidebar-filters';
import {
  createPrompt,
  duplicatePrompt,
  fetchCategories,
  fetchPrompts,
  fetchTags,
  removePrompt,
  toggleFavorite,
  updatePrompt
} from '@/lib/api';
import type { Prompt, PromptCreateInput } from '@/types/prompt';

const PAGE_SIZE = 30;

export function PromptLibrary() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [loadedTags, loadedCategories] = await Promise.all([fetchTags(), fetchCategories()]);
        setTags(loadedTags);
        setCategories(loadedCategories);
      } catch (e) {
        console.error(e);
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
          query: debouncedQuery,
          tags: selectedTags,
          category: selectedCategory,
          page,
          pageSize: PAGE_SIZE
        });
        setPrompts(result.data);
        setTotalCount(result.count);
      } catch (e) {
        console.error(e);
        setError('Failed to load prompts');
      } finally {
        setLoading(false);
      }
    }

    void loadPrompts();
  }, [debouncedQuery, selectedTags, selectedCategory, page]);

  const pageCount = useMemo(() => Math.max(Math.ceil(totalCount / PAGE_SIZE), 1), [totalCount]);

  function toggleTag(tag: string) {
    setPage(1);
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]
    );
  }

  function resetFilters() {
    setSelectedTags([]);
    setSelectedCategory('');
    setQuery('');
    setPage(1);
  }

  async function refresh() {
    const result = await fetchPrompts({
      query: debouncedQuery,
      tags: selectedTags,
      category: selectedCategory,
      page,
      pageSize: PAGE_SIZE
    });
    setPrompts(result.data);
    setTotalCount(result.count);

    const [loadedTags, loadedCategories] = await Promise.all([fetchTags(), fetchCategories()]);
    setTags(loadedTags);
    setCategories(loadedCategories);
  }

  async function handleCreateOrUpdate(input: PromptCreateInput) {
    try {
      if (editingPrompt) {
        await updatePrompt(editingPrompt.id, input);
      } else {
        await createPrompt(input);
      }

      setEditingPrompt(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save prompt');
    }
  }

  async function handleDuplicate(id: string) {
    try {
      await duplicatePrompt(id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to duplicate prompt');
    }
  }

  async function handleToggleFavorite(id: string) {
    try {
      await toggleFavorite(id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to toggle favorite');
    }
  }

  async function handleDelete(id: string) {
    try {
      await removePrompt(id);
      setDetailOpen(false);
      setSelectedPrompt(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete prompt');
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-[1600px] gap-4 p-4 md:p-8">
        <div className="hidden w-72 shrink-0 md:block">
          <SidebarFilters
            tags={tags}
            categories={categories}
            selectedTags={selectedTags}
            selectedCategory={selectedCategory}
            onToggleTag={toggleTag}
            onCategoryChange={(value) => {
              setSelectedCategory(value);
              setPage(1);
            }}
            onReset={resetFilters}
          />
        </div>

        <section className="flex-1 space-y-4">
          <header className="panel p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-5xl font-medium tracking-tight md:text-7xl">PROMPT LIBRARY.</h1>
              <Button
                onClick={() => {
                  setEditingPrompt(null);
                  setFormOpen(true);
                }}
              >
                <Plus size={14} className="mr-1" /> New Prompt
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[260px] flex-1">
                <Search size={16} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  className="w-full border-b border-line bg-transparent py-2 pl-8 text-lg"
                  placeholder="Search title + prompt text"
                  value={query}
                  onChange={(e) => {
                    setPage(1);
                    setQuery(e.target.value);
                  }}
                />
              </div>

              <div className="flex gap-1 border border-line p-1">
                <button
                  className={`p-2 ${view === 'grid' ? 'bg-text text-bg' : 'text-muted'}`}
                  onClick={() => setView('grid')}
                  aria-label="Grid view"
                >
                  <Grid2X2 size={16} />
                </button>
                <button
                  className={`p-2 ${view === 'list' ? 'bg-text text-bg' : 'text-muted'}`}
                  onClick={() => setView('list')}
                  aria-label="List view"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </header>

          <div className="md:hidden">
            <details className="panel p-3">
              <summary className="cursor-pointer text-xs uppercase tracking-[0.24em] text-muted">
                Filters
              </summary>
              <div className="mt-3">
                <SidebarFilters
                  tags={tags}
                  categories={categories}
                  selectedTags={selectedTags}
                  selectedCategory={selectedCategory}
                  onToggleTag={toggleTag}
                  onCategoryChange={(value) => {
                    setSelectedCategory(value);
                    setPage(1);
                  }}
                  onReset={resetFilters}
                />
              </div>
            </details>
          </div>

          <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted">
            <span>{totalCount} total</span>
            <span>
              Page {page} / {pageCount}
            </span>
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          {loading ? (
            <div className="panel p-5 text-sm text-muted">Loading...</div>
          ) : (
            <div className={view === 'grid' ? 'grid gap-3 md:grid-cols-2 xl:grid-cols-3' : 'space-y-2'}>
              {prompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  view={view}
                  onClick={(picked) => {
                    setSelectedPrompt(picked);
                    setDetailOpen(true);
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 pt-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </Button>
            <Button
              variant="outline"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </section>
      </div>

      <PromptFormDialog
        open={formOpen}
        onOpenChange={(value) => {
          if (!value) setEditingPrompt(null);
          setFormOpen(value);
        }}
        onSubmit={handleCreateOrUpdate}
        initial={editingPrompt}
      />

      <PromptDetailDialog
        open={detailOpen}
        prompt={selectedPrompt}
        onOpenChange={setDetailOpen}
        onEdit={(prompt) => {
          setEditingPrompt(prompt);
          setFormOpen(true);
        }}
        onDuplicate={handleDuplicate}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDelete}
      />
    </main>
  );
}
