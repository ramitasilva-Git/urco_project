-- ============================================================================
--  URCO · Esquema de base de datos (Supabase / Postgres)
--  Ejecutá TODO este archivo en:  Supabase → SQL Editor → New query → Run
-- ============================================================================

-- 1) Tabla de productos --------------------------------------------------------
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique,
  name            text not null,
  category        text not null,
  price           numeric not null default 0,
  discounted_price numeric,
  in_stock        boolean not null default true,
  description     text default '',
  specs           jsonb not null default '{}'::jsonb,
  images          jsonb not null default '[]'::jsonb,
  sort_index      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Mantener updated_at al día
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated
  before update on public.products
  for each row execute function public.set_updated_at();

-- 2) Row Level Security --------------------------------------------------------
alter table public.products enable row level security;

-- Lectura PÚBLICA (cualquier visitante puede ver el catálogo)
drop policy if exists products_read_public on public.products;
create policy products_read_public on public.products
  for select using (true);

-- Escritura SÓLO para usuarios autenticados (el admin logueado)
drop policy if exists products_write_auth on public.products;
create policy products_write_auth on public.products
  for all to authenticated using (true) with check (true);

-- 3) Storage: bucket público para imágenes ------------------------------------
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Lectura pública de las imágenes
drop policy if exists products_img_read on storage.objects;
create policy products_img_read on storage.objects
  for select using (bucket_id = 'products');

-- Subir / reemplazar / borrar imágenes: sólo autenticados
drop policy if exists products_img_write on storage.objects;
create policy products_img_write on storage.objects
  for all to authenticated
  using (bucket_id = 'products')
  with check (bucket_id = 'products');

-- Listo. Opcional: cargá el catálogo inicial ejecutando db/seed.sql
