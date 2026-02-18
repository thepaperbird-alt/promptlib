export interface Prompt {
  id: string;
  title: string;
  prompt_text: string;
  model: string;
  tags: string[];
  category: string;
  sample_image_url: string | null;
  version: number;
  favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromptListResponse {
  data: Prompt[];
  count: number;
  page: number;
  pageSize: number;
}

export interface PromptFilters {
  query?: string;
  tags?: string[];
  category?: string;
  page?: number;
  pageSize?: number;
  view?: 'grid' | 'list';
}

export type PromptCreateInput = Omit<
  Prompt,
  'id' | 'created_at' | 'updated_at' | 'version'
> & {
  version?: number;
};

export type PromptUpdateInput = Partial<PromptCreateInput>;
