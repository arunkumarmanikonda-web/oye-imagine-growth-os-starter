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

insert into public.cms_claims_register (claim_key,claim_pattern,capability,minimum_state,current_state,approval_required,notes) values
('live-integration','live integration','external provider execution','production_executed','code_capability',true,'Use only when provider-side production evidence exists.'),
('fully-autonomous','fully autonomous','high-autonomy agent execution','production_executed','code_capability',true,'Requires enforced autonomy policy and production tool evidence.'),
('automatic-ad-spend','automatic ad spend','paid-media autonomous spend','production_executed','code_capability',true,'Requires provider execution and reconciled spend controls.'),
('spend-reconciled','automatically reconciled','media spend reconciliation','production_executed','code_capability',true,'Requires provider spend and ledger reconciliation evidence.'),
('certified-soc2','SOC 2 certified','SOC 2 certification','production_executed','code_capability',true,'Never publish without issued certification evidence.'),
('certified-iso','ISO 27001 certified','ISO 27001 certification','production_executed','code_capability',true,'Never publish without issued certification evidence.'),
('all-integrations-live','all integrations are live','all provider integrations','production_executed','code_capability',true,'Platform capability and client-specific connection are distinct.')
on conflict (claim_key) do nothing;
commit;