-- Jalankan sekali di Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100),
  category text not null,
  city text not null,
  description text not null default '',
  price text not null default '',
  whatsapp text not null,
  emoji text not null default '🏪',
  status text not null default 'approved' check (status in ('pending','approved','rejected')),
  is_pro boolean not null default false,
  pro_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.pro_payments (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount > 0),
  plan_months integer not null check (plan_months in (1,12)),
  status text not null default 'pending' check (status in ('pending','paid','expired','failed')),
  transaction_status text,
  snap_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists businesses_public_listing on public.businesses(status, created_at desc);
create index if not exists businesses_owner on public.businesses(owner_id);
create index if not exists pro_payments_business on public.pro_payments(business_id, created_at desc);

alter table public.businesses enable row level security;
alter table public.pro_payments enable row level security;
-- Public reads approved listings only; writes are performed through authenticated server routes.
create policy "Anyone can read approved businesses" on public.businesses for select using (status = 'approved');
-- Service role used by server routes bypasses RLS. Never expose its key to the browser.
