'use client';

import { Button } from '@/components/button';

interface SidebarFiltersProps {
  tags: string[];
  categories: string[];
  selectedTags: string[];
  selectedCategory: string;
  onToggleTag: (tag: string) => void;
  onCategoryChange: (category: string) => void;
  onReset: () => void;
}

export function SidebarFilters({
  tags,
  categories,
  selectedTags,
  selectedCategory,
  onToggleTag,
  onCategoryChange,
  onReset
}: SidebarFiltersProps) {
  return (
    <aside className="panel h-full p-4">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-[0.24em] text-muted">Filters</h2>
        <Button variant="ghost" className="px-0 text-xs" onClick={onReset}>
          Reset
        </Button>
      </div>

      <section className="mb-6">
        <h3 className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">Category</h3>
        <div className="space-y-1">
          <button
            className={`block w-full border px-2 py-1 text-left text-sm ${
              selectedCategory === '' ? 'border-accent text-text' : 'border-line text-muted'
            }`}
            onClick={() => onCategoryChange('')}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={`block w-full border px-2 py-1 text-left text-sm ${
                selectedCategory === category ? 'border-accent text-text' : 'border-line text-muted'
              }`}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                className={`border px-2 py-1 text-xs ${
                  active ? 'border-accent text-text' : 'border-line text-muted'
                }`}
                onClick={() => onToggleTag(tag)}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
