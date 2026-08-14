begin;

alter table public.core_role_definitions
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.core_permission_catalog (
  permission_key text primary key,
  category text not null,
  label text not null,
  description text not null,
  risk_class text not null default 'low' check (risk_class in ('low','medium','high','critical')),
  system_permission boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.core_permission_catalog enable row level security;
grant select on public.core_permission_catalog to authenticated;
grant all on public.core_permission_catalog to service_role;
drop policy if exists core_permission_catalog_authenticated_read on public.core_permission_catalog;
create policy core_permission_catalog_authenticated_read
on public.core_permission_catalog
for select
to authenticated
using (true);

insert into public.core_permission_catalog(permission_key,category,label,description,risk_class)
values
  ('platform.access','Platform','Access Control','Create, suspend, delete and govern users, roles and overrides.','critical'),
  ('platform.config','Platform','Provider & System Configuration','Manage provider credentials, capability routing and global configuration.','critical'),
  ('tenant.view','Tenant','View tenant','Read tenant identity and configuration.','low'),
  ('tenant.update','Tenant','Update tenant','Change tenant settings.','high'),
  ('brand.view','Brand','View brand','Read brand truth, identity and knowledge.','low'),
  ('brand.update','Brand','Update brand','Edit authoritative brand truth and settings.','high'),
  ('workspace.view','Workspace','View workspace','Enter and read the assigned workspace.','low'),
  ('workspace.update','Workspace','Update workspace','Change workspace settings and operating context.','high'),
  ('content.view','Content','View content','Read content drafts and approved content.','low'),
  ('content.create','Content','Create content','Create content drafts.','medium'),
  ('content.update','Content','Edit content','Edit content drafts and metadata.','medium'),
  ('content.approve','Content','Approve content','Approve content for governed publishing.','high'),
  ('content.publish','Content','Publish content','Publish approved content.','critical'),
  ('creative.view','Creative','View creative','Read creative assets and lineage.','low'),
  ('creative.create','Creative','Create creative','Create or upload creative assets.','medium'),
  ('creative.update','Creative','Edit creative','Revise creative assets and derivatives.','medium'),
  ('creative.generate','Creative','Generate creative','Use Oye AI to generate images/video/copy assets.','medium'),
  ('creative.approve','Creative','Approve creative','Designer approval of generated or edited creative.','high'),
  ('creative.publish','Creative','Publish creative','Release approved creative to a publishing workflow.','critical'),
  ('creative.delete','Creative','Delete creative','Delete eligible creative assets.','high'),
  ('campaign.view','Campaign','View campaigns','Read campaign plans, drafts and status.','low'),
  ('campaign.create','Campaign','Create campaigns','Create campaign plans and drafts.','medium'),
  ('campaign.update','Campaign','Edit campaigns','Modify campaign configuration before approval.','high'),
  ('campaign.approve','Campaign','Approve campaigns','Sign off a campaign for governed execution.','critical'),
  ('campaign.launch','Campaign','Launch campaigns','Execute an approved campaign through a connected channel.','critical'),
  ('analytics.view','Analytics','View analytics','Read normalized performance and attribution data.','low'),
  ('reporting.view','Reporting','View reports','Read approved and generated reports.','low'),
  ('reporting.generate','Reporting','Generate reports','Generate on-demand reports within entitlement.','medium'),
  ('reporting.publish','Reporting','Publish reports','Release verified reports to client users.','medium'),
  ('integration.view','Integrations','View integrations','Read connection and freshness status.','low'),
  ('integration.manage','Integrations','Manage integrations','Connect, reauthorize or disconnect tenant integrations.','high'),
  ('approval.view','Approvals','View approvals','Read approval queues and evidence.','low'),
  ('approval.act','Approvals','Act on approvals','Approve or reject eligible governed actions.','high'),
  ('finance.view','Finance','View finance','Read invoices, subscriptions and media balances.','low'),
  ('finance.approve','Finance','Approve finance','Approve governed financial actions.','critical'),
  ('invoice.view','Finance','View invoices','Read invoices.','low'),
  ('subscription.view','Finance','View subscription','Read subscription and entitlement state.','low'),
  ('marketplace.view','Marketplace','View marketplace','Read assigned specialist and marketplace work.','low'),
  ('marketplace.update','Marketplace','Update marketplace work','Update assigned proposals or deliverables.','medium'),
  ('privacy.view','Privacy','View privacy controls','Read consent, DSAR and retention controls.','high'),
  ('privacy.manage','Privacy','Manage privacy controls','Execute authorized privacy and retention workflows.','critical'),
  ('ai.agent.manage','AI','Manage AI agents','Configure or execute bounded specialist agents.','high'),
  ('ai.search','AI','Use Ask Oye','Use permission-aware global AI search and command assistance.','low')
on conflict (permission_key) do update set
  category=excluded.category,
  label=excluded.label,
  description=excluded.description,
  risk_class=excluded.risk_class,
  updated_at=now();

-- Record built-in experience templates so custom roles can inherit UI/lane/MFA behavior
-- without receiving the built-in role's permissions automatically.
update public.core_role_definitions
set metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
  'experienceRoleKey', role_key,
  'accessLane', case when role_key in ('client_operator','viewer') then 'client' else 'admin' end,
  'requiresMfa', case when role_key in ('client_operator','viewer') then false else true end
)
where system_role = true;

commit;
