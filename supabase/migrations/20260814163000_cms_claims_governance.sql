begin;
create table if not exists public.cms_claims_register (
  claim_key text primary key,
  claim_pattern text not null,
  capability text not null,
  minimum_state text not null check (minimum_state in ('code_capability','configured','connected','read_verified','sandbox_executed','production_executed')),
  current_state text not null default 'code_capability' check (current_state in ('code_capability','configured','connected','read_verified','sandbox_executed','production_executed')),
  approval_required boolean not null default true,
  approved_by text,
  approved_at timestamptz,
  evidence_refs jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cms_claims_register enable row level security;
revoke all on public.cms_claims_register from anon, authenticated;
grant all on public.cms_claims_register to service_role;
commit;