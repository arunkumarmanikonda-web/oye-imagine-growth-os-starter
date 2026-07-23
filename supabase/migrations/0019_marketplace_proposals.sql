create extension if not exists pgcrypto;

create table if not exists public.marketplace_proposals (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.marketplace_requests(id) on delete cascade,
  specialist_id uuid null references public.marketplace_specialists(id) on delete set null,
  specialist_slug text null,
  specialist_name text null,
  title text not null,
  scope_summary text not null,
  deliverables text[] not null default '{}',
  price_inr integer not null check (price_inr > 0),
  timeline_days integer not null check (timeline_days > 0),
  notes text null,
  status text not null default 'sent' check (status in ('draft','sent','accepted','rejected','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_marketplace_proposals_request_created
  on public.marketplace_proposals(request_id, created_at desc);

create index if not exists idx_marketplace_proposals_specialist_created
  on public.marketplace_proposals(specialist_slug, created_at desc);

alter table public.marketplace_proposals enable row level security;

drop policy if exists marketplace_proposals_service_role_all on public.marketplace_proposals;

create policy marketplace_proposals_service_role_all
  on public.marketplace_proposals
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');