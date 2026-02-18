'use client';

import { Heart } from 'lucide-react';
import type { Prompt } from '@/types/prompt';

interface PromptCardProps {
  prompt: Prompt;
  view: 'grid' | 'list';
  onClick: (prompt: Prompt) => void;
}

export function PromptCard({ prompt, view, onClick }: PromptCardProps) {
  return (
    <button
      className={`panel text-left transition hover:border-accent ${
        view === 'grid' ? 'p-4' : 'p-3'
      }`}
      onClick={() => onClick(prompt)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="max-h-14 overflow-hidden text-lg tracking-tight">[{prompt.title}]</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">{prompt.category}</p>
        </div>
        {prompt.favorite && <Heart size={14} className="fill-current text-text" />}
      </div>

      <p className="mt-3 max-h-16 overflow-hidden text-sm text-muted">{prompt.prompt_text}</p>

      <div className="mt-4 flex flex-wrap gap-1">
        {prompt.tags.slice(0, 5).map((tag) => (
          <span key={tag} className="border border-line px-2 py-1 text-xs text-muted">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 text-xs text-muted">v{prompt.version}</div>
    </button>
  );
}
