-- ============================================================================
--  URCO · Tabla de categorías (migración)
--  Si ya corriste schema.sql antes de tener categorías dinámicas, ejecutá
--  ESTE archivo una vez en:  Supabase → SQL Editor → New query → Run
-- ============================================================================

-- Función de updated_at (por si no existe todavía)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- 1) Tabla de categorías -------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  icon        text not null default 'blade',
  image       text default '',
  blurb       text default '',
  sort_index  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_categories_updated on public.categories;
create trigger trg_categories_updated
  before update on public.categories
  for each row execute function public.set_updated_at();

-- 2) Row Level Security --------------------------------------------------------
alter table public.categories enable row level security;

-- Lectura pública
drop policy if exists categories_read_public on public.categories;
create policy categories_read_public on public.categories
  for select using (true);

-- Escritura sólo autenticados (admin)
drop policy if exists categories_write_auth on public.categories;
create policy categories_write_auth on public.categories
  for all to authenticated using (true) with check (true);

-- 3) Categorías iniciales ------------------------------------------------------
insert into public.categories (slug, name, icon, image, blurb, sort_index) values
  ('cocina',     'COCINA',     'chef',     'assets/img/cat-cocina.jpg',     'Precisión y rendimiento en cada corte.', 1),
  ('japones',    'JAPONES',    'torii',    'assets/img/cat-japones.jpg',    'Tradición japonesa, filo impecable.',    2),
  ('aire-libre', 'AIRE LIBRE', 'mountain', 'assets/img/cat-aire-libre.jpg', 'Hechos para cada aventura.',             3)
on conflict (slug) do nothing;
