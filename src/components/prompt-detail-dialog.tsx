'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import { Copy, Heart, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/button';
import type { Prompt } from '@/types/prompt';

interface PromptDetailDialogProps {
  open: boolean;
  prompt: Prompt | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (prompt: Prompt) => void;
  onDuplicate: (id: string) => Promise<void>;
  onToggleFavorite: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function PromptDetailDialog({
  open,
  prompt,
  onOpenChange,
  onEdit,
  onDuplicate,
  onToggleFavorite,
  onDelete
}: PromptDetailDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!prompt) return null;

  async function handleCopyPromptText() {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt.prompt_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-xl panel p-6 overflow-y-auto">
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-xs uppercase tracking-[0.24em] text-muted">
              Prompt Detail
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-muted hover:text-text">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <h2 className="text-3xl tracking-tight">[{prompt.title}]</h2>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
            <span>Model: {prompt.model}</span>
            <span>Version: v{prompt.version}</span>
          </div>

          <div className="mt-6 space-y-6">
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-[0.2em] text-muted">Prompt</h3>
                <button
                  className="inline-flex items-center gap-1 border border-line px-2 py-1 text-xs text-muted hover:text-text hover:border-accent"
                  onClick={handleCopyPromptText}
                  type="button"
                >
                  <Copy size={12} />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap border border-line p-3 text-sm">{prompt.prompt_text}</pre>
            </section>

            <section>
              <h3 className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag) => (
                  <span key={tag} className="border border-line px-2 py-1 text-xs text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {prompt.sample_image_url && (
              <section>
                <h3 className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">Sample Image</h3>
                <div className="relative aspect-video w-full overflow-hidden border border-line">
                  <Image
                    src={prompt.sample_image_url}
                    alt={prompt.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 500px"
                  />
                </div>
              </section>
            )}
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => onEdit(prompt)}>
              <Pencil size={14} className="mr-1" /> Edit
            </Button>
            <Button variant="outline" onClick={() => onDuplicate(prompt.id)}>
              <Copy size={14} className="mr-1" /> Duplicate
            </Button>
            <Button variant="outline" onClick={() => onToggleFavorite(prompt.id)}>
              <Heart size={14} className="mr-1" /> {prompt.favorite ? 'Unfavorite' : 'Favorite'}
            </Button>
            <Button variant="danger" onClick={() => onDelete(prompt.id)}>
              <Trash2 size={14} className="mr-1" /> Delete
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
