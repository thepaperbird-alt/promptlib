import { z } from 'zod';

export const promptSchema = z.object({
  title: z.string().min(1).max(200),
  prompt_text: z.string().min(1),
  model: z.string().min(1).max(100),
  tags: z.array(z.string().min(1).max(50)).max(40),
  category: z.string().min(1).max(80),
  sample_image_url: z.string().url().nullable().optional().or(z.literal('')),
  favorite: z.boolean().default(false)
});

export const promptUpdateSchema = promptSchema.partial();
