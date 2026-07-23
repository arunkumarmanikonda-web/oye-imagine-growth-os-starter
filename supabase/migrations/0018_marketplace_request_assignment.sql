alter table public.marketplace_requests
  add column if not exists assigned_specialist_id uuid null references public.marketplace_specialists(id) on delete set null;

alter table public.marketplace_requests
  add column if not exists assigned_specialist_slug text null;

alter table public.marketplace_requests
  add column if not exists assigned_specialist_name text null;

create index if not exists idx_marketplace_requests_assigned_specialist
  on public.marketplace_requests(assigned_specialist_slug, status, created_at desc);