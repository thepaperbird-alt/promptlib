create extension if not exists pg_trgm;

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  prompt_text text not null,
  model text not null,
  tags text[] not null default '{}',
  category text not null,
  sample_image_url text,
  version integer not null default 1,
  favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_tsv tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(prompt_text, '')), 'B')
  ) stored
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_prompts_updated_at on public.prompts;
create trigger trg_prompts_updated_at
before update on public.prompts
for each row
execute function public.set_updated_at();

create index if not exists idx_prompts_search_tsv on public.prompts using gin (search_tsv);
create index if not exists idx_prompts_tags_gin on public.prompts using gin (tags);
create index if not exists idx_prompts_category on public.prompts (category);
create index if not exists idx_prompts_created_at on public.prompts (created_at desc);
create index if not exists idx_prompts_favorite on public.prompts (favorite);
create index if not exists idx_prompts_title_trgm on public.prompts using gin (title gin_trgm_ops);

create or replace function public.search_prompts(
  q text default '',
  tags_filter text[] default '{}',
  category_filter text default '',
  page_num integer default 1,
  page_size integer default 30
)
returns table (
  id uuid,
  title text,
  prompt_text text,
  model text,
  tags text[],
  category text,
  sample_image_url text,
  version integer,
  favorite boolean,
  created_at timestamptz,
  updated_at timestamptz,
  total_count bigint
)
language sql
stable
as $$
  with filtered as (
    select p.*
    from public.prompts p
    where (
      q = ''
      or p.search_tsv @@ websearch_to_tsquery('simple', q)
      or p.title ilike ('%' || q || '%')
    )
    and (
      cardinality(tags_filter) = 0
      or p.tags @> tags_filter
    )
    and (
      category_filter = ''
      or p.category = category_filter
    )
  )
  select
    f.id,
    f.title,
    f.prompt_text,
    f.model,
    f.tags,
    f.category,
    f.sample_image_url,
    f.version,
    f.favorite,
    f.created_at,
    f.updated_at,
    count(*) over() as total_count
  from filtered f
  order by f.updated_at desc
  offset greatest(page_num - 1, 0) * page_size
  limit page_size;
$$;
