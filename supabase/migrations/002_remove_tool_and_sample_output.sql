alter table if exists public.prompts
  drop column if exists tool,
  drop column if exists sample_output;

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
