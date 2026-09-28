-- KomikNest schema.
-- Image URLs are stored as one text[] per chapter (not one row per image),
-- which keeps the database roughly 10x smaller than a row-per-image design.

create extension if not exists pgcrypto;

create table public.comics (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title        text not null,
  title_en     text,
  author       text,
  artist       text,
  cover_url    text not null,
  synopsis     jsonb not null default '{}'::jsonb,
  genres       text[] not null default '{}',
  status       text not null default 'ongoing' check (status in ('ongoing', 'completed', 'hiatus')),
  format       text not null default 'webtoon' check (format in ('webtoon', 'page')),
  featured     boolean not null default false,
  published    boolean not null default true,
  license      text not null,
  source_name  text,
  source_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index comics_updated_idx on public.comics (updated_at desc) where published;
create index comics_genres_idx on public.comics using gin (genres);

create table public.chapters (
  id            uuid primary key default gen_random_uuid(),
  comic_id      uuid not null references public.comics (id) on delete cascade,
  lang          text not null check (lang in ('id', 'en')),
  number        numeric(7, 2) not null check (number > 0),
  title         text,
  image_base    text not null default '',
  images        text[] not null check (cardinality(images) > 0),
  published_at  timestamptz not null default now(),
  unique (comic_id, lang, number)
);

create index chapters_comic_idx on public.chapters (comic_id, number desc);

-- Bump comics.updated_at whenever a chapter is added or changed,
-- so "latest updates" ordering stays correct without extra writes.
create function public.touch_comic() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.comics set updated_at = now() where id = new.comic_id;
  return new;
end $$;

create trigger chapters_touch_comic
after insert or update on public.chapters
for each row execute function public.touch_comic();

-- Card view: comic + its latest chapter number, one query for grids.
create view public.comic_cards with (security_invoker = true) as
select
  c.slug, c.title, c.title_en, c.cover_url, c.genres, c.status, c.format,
  c.featured, c.updated_at,
  coalesce(
    (select array_agg(distinct ch.lang) from public.chapters ch where ch.comic_id = c.id),
    '{}'
  ) as languages,
  (select max(ch.number) from public.chapters ch where ch.comic_id = c.id) as latest_chapter
from public.comics c
where c.published;

-- Row Level Security: the public (anon) key can only read published data.
-- Writes happen exclusively through the service-role key in CI.
alter table public.comics enable row level security;
alter table public.chapters enable row level security;

create policy "public read comics" on public.comics
  for select to anon, authenticated using (published);

create policy "public read chapters" on public.chapters
  for select to anon, authenticated using (
    exists (select 1 from public.comics c where c.id = comic_id and c.published)
  );
