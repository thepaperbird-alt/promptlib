'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/button';
import { normalizeTags } from '@/lib/utils';
import type { Prompt, PromptCreateInput } from '@/types/prompt';

interface PromptFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PromptCreateInput) => Promise<void>;
  initial?: Prompt | null;
}

export function PromptFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initial
}: PromptFormDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [model, setModel] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [sampleImageUrl, setSampleImageUrl] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEdit = useMemo(() => Boolean(initial), [initial]);

  useEffect(() => {
    if (!open) return;

    setTitle(initial?.title ?? '');
    setPromptText(initial?.prompt_text ?? '');
    setModel(initial?.model ?? '');
    setTags(initial?.tags?.join(', ') ?? '');
    setCategory(initial?.category ?? '');
    setSampleImageUrl(initial?.sample_image_url ?? '');
    setFavorite(initial?.favorite ?? false);
  }, [initial, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      await onSubmit({
        title,
        prompt_text: promptText,
        model,
        tags: normalizeTags(tags),
        category,
        sample_image_url: sampleImageUrl || null,
        favorite
      });

      onOpenChange(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save prompt');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[96vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-sm uppercase tracking-[0.24em] text-muted">
              {isEdit ? 'Edit Prompt' : 'New Prompt'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-muted hover:text-text">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && <p className="text-sm text-red-300">{formError}</p>}
            <input
              className="minimal-input w-full"
              placeholder="[ Prompt title ]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              className="min-h-36 w-full border border-line bg-transparent p-3 text-sm text-text placeholder:text-muted"
              placeholder="Prompt text (markdown supported)"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                className="border-b border-line bg-transparent p-2 text-sm"
                placeholder="Model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
              <input
                className="border-b border-line bg-transparent p-2 text-sm"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                className="border-b border-line bg-transparent p-2 text-sm"
                placeholder="Tags (comma-separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                required
              />
              <input
                className="border-b border-line bg-transparent p-2 text-sm"
                placeholder="Sample image URL (optional)"
                value={sampleImageUrl}
                onChange={(e) => setSampleImageUrl(e.target.value)}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
              />
              Favorite
            </label>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
