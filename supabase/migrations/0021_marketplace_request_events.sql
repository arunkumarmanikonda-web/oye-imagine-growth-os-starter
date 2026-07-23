create extension if not exists pgcrypto;

create table if not exists public.marketplace_request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.marketplace_requests(id) on delete cascade,
  proposal_id uuid null references public.marketplace_proposals(id) on delete set null,
  event_type text not null check (
    event_type in (
      'proposal_created',
      'proposal_status_changed',
      'request_status_changed',
      'request_closed',
      'request_reopened'
    )
  ),
  actor text not null default 'admin',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_marketplace_request_events_request_created
  on public.marketplace_request_events(request_id, created_at desc);

create index if not exists idx_marketplace_request_events_proposal_created
  on public.marketplace_request_events(proposal_id, created_at desc);

alter table public.marketplace_request_events enable row level security;

drop policy if exists marketplace_request_events_service_role_all on public.marketplace_request_events;

create policy marketplace_request_events_service_role_all
  on public.marketplace_request_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');