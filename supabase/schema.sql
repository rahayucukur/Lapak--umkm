-- Jalankan sekali di Supabase SQL Editor untuk proyek baru.
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

-- Idempotent schema upgrade, including projects that ran the original schema already.
alter table public.pro_payments add column if not exists plan_id text;
alter table public.pro_payments drop constraint if exists pro_payments_plan_months_check;
alter table public.pro_payments add constraint pro_payments_plan_months_check check (plan_months in (1,7,12,15));
update public.pro_payments set plan_id = case when plan_months = 12 then 'pro_1_tahun' else 'pro_1_bulan' end where plan_id is null;
alter table public.pro_payments alter column plan_id set not null;
alter table public.pro_payments drop constraint if exists pro_payments_plan_id_check;
alter table public.pro_payments add constraint pro_payments_plan_id_check check (plan_id in ('pro_1_bulan','pro_6_bulan','pro_1_tahun'));

create index if not exists businesses_public_listing on public.businesses(status, created_at desc);
create index if not exists businesses_owner on public.businesses(owner_id);
create index if not exists pro_payments_business on public.pro_payments(business_id, created_at desc);

alter table public.businesses enable row level security;
alter table public.pro_payments enable row level security;
drop policy if exists "Anyone can read approved businesses" on public.businesses;
create policy "Anyone can read approved businesses" on public.businesses for select using (status = 'approved');

-- Apply Pro once under row lock so retried Midtrans notifications cannot extend the plan repeatedly.
create or replace function public.apply_midtrans_notification(
  p_order_id text,
  p_amount integer,
  p_status text,
  p_transaction_status text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  payment_row public.pro_payments%rowtype;
  expiry timestamptz;
begin
  select * into payment_row from public.pro_payments where order_id = p_order_id for update;
  if not found or payment_row.amount <> p_amount then raise exception 'Unknown order or amount mismatch'; end if;
  if payment_row.status = 'paid' then return; end if;
  update public.pro_payments set status = p_status, transaction_status = p_transaction_status, updated_at = now() where id = payment_row.id;
  if p_status = 'paid' then
    select pro_until into expiry from public.businesses where id = payment_row.business_id for update;
    if not found then raise exception 'Business not found'; end if;
    expiry := greatest(coalesce(expiry, now()), now()) + make_interval(months => payment_row.plan_months);
    update public.businesses set is_pro = true, pro_until = expiry where id = payment_row.business_id;
  end if;
end;
$$;
revoke all on function public.apply_midtrans_notification(text, integer, text, text) from public, anon, authenticated;
grant execute on function public.apply_midtrans_notification(text, integer, text, text) to service_role;
