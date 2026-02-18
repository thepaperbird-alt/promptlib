# Prompt Library

A solo prompt management system built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## 1) Project Scaffold

```text
/Users/maheshravi/Documents/Codex Projects/PromptLibrary
├── .env.example
├── .eslintrc.json
├── .gitignore
├── README.md
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── supabase
│   └── migrations
│       └── 001_init.sql
└── src
    ├── app
    │   ├── api
    │   │   ├── categories
    │   │   │   └── route.ts
    │   │   ├── prompts
    │   │   │   ├── [id]
    │   │   │   │   ├── duplicate
    │   │   │   │   │   └── route.ts
    │   │   │   │   ├── favorite
    │   │   │   │   │   └── route.ts
    │   │   │   │   └── route.ts
    │   │   │   └── route.ts
    │   │   ├── tags
    │   │   │   └── route.ts
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components
    │   ├── button.tsx
    │   ├── prompt-card.tsx
    │   ├── prompt-detail-dialog.tsx
    │   ├── prompt-form-dialog.tsx
    │   ├── prompt-library.tsx
    │   └── sidebar-filters.tsx
    ├── lib
    │   ├── api.ts
    │   ├── env.ts
    │   ├── prompt-service.ts
    │   ├── supabase-client.ts
    │   ├── utils.ts
    │   └── validators.ts
    └── types
        └── prompt.ts
```

## 2) Supabase Setup

1. Create a new Supabase project.
2. Go to **SQL Editor**.
3. Run the SQL in:
   - `/Users/maheshravi/Documents/Codex Projects/PromptLibrary/supabase/migrations/001_init.sql`
4. If you already applied an earlier schema version with `tool`/`sample_output`, run:
   - `/Users/maheshravi/Documents/Codex Projects/PromptLibrary/supabase/migrations/002_remove_tool_and_sample_output.sql`

## 3) Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Set values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 4) Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5) Deploy to Vercel

1. Push repo to GitHub.
2. Import project into Vercel.
3. Add environment variables in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy.

## 6) API Routes

### List/search prompts

`GET /api/prompts?query=agent&page=1&pageSize=30&category=research&tag=seo&tag=marketing`

### Create prompt

`POST /api/prompts`

```json
{
  "title": "Landing Page Generator",
  "prompt_text": "Write a high-converting landing page for...",
  "model": "gpt-4.1",
  "tags": ["copywriting", "seo"],
  "category": "marketing",
  "sample_image_url": "https://...",
  "favorite": true
}
```

### Update prompt

`PATCH /api/prompts/:id`

### Delete prompt

`DELETE /api/prompts/:id`

### Duplicate prompt (increments version)

`POST /api/prompts/:id/duplicate`

### Toggle favorite

`POST /api/prompts/:id/favorite`

## 7) Notes

- Full-text search uses generated `tsvector` + GIN index.
- Tags use `text[]` with GIN index for fast containment filter.
- Category uses B-tree index.
- Pagination is server-side and tuned for 10k prompts.
- UI is dark-mode-first and desktop-first with mobile support.
