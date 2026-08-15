begin;

create table if not exists public.commercial_public_plan_catalog (
  plan_key text primary key,
  sort_order integer not null,
  display_name text not null,
  audience text not null,
  price_mode text not null default 'fixed' check (price_mode in ('fixed','from','custom')),
  monthly_price_inr numeric(14,2),
  annual_price_inr numeric(14,2),
  onboarding_fee_inr numeric(14,2),
  annual_label text,
  highlights jsonb not null default '[]'::jsonb,
  included_modules jsonb not null default '[]'::jsonb,
  usage_allowances jsonb not null default '{}'::jsonb,
  support_tier text not null default 'standard',
  cta_label text not null default 'Start now',
  cta_href text not null default '/signup',
  featured boolean not null default false,
  public boolean not null default true,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  version integer not null default 1 check (version >= 1),
  effective_from timestamptz,
  effective_until timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (price_mode='custom' or monthly_price_inr is not null),
  check (price_mode='custom' or annual_price_inr is not null)
);

create table if not exists public.commercial_public_pricing_policy (
  policy_key text primary key,
  currency_code text not null default 'INR',
  currency_symbol text not null default '₹',
  tax_label text not null default 'GST extra as applicable',
  annual_savings_label text not null default 'Pay for 10 months. Use for 12.',
  media_spend_included boolean not null default false,
  provider_pass_through_included boolean not null default false,
  ai_fair_use_included boolean not null default true,
  policy_copy jsonb not null default '{}'::jsonb,
  status text not null default 'published' check (status in ('draft','published','archived')),
  version integer not null default 1,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.commercial_public_pricing_versions (
  version_id bigint generated always as identity primary key,
  entity_type text not null check (entity_type in ('plan','policy')),
  entity_key text not null,
  version integer not null,
  snapshot jsonb not null,
  change_reason text not null,
  actor_user_id text,
  created_at timestamptz not null default now(),
  unique(entity_type, entity_key, version)
);

create index if not exists idx_public_plan_catalog_published on public.commercial_public_plan_catalog(status,public,sort_order);
create index if not exists idx_public_pricing_versions_entity on public.commercial_public_pricing_versions(entity_type,entity_key,version desc);

alter table public.commercial_public_plan_catalog enable row level security;
alter table public.commercial_public_pricing_policy enable row level security;
alter table public.commercial_public_pricing_versions enable row level security;
revoke all on public.commercial_public_plan_catalog from anon, authenticated;
revoke all on public.commercial_public_pricing_policy from anon, authenticated;
revoke all on public.commercial_public_pricing_versions from anon, authenticated;
grant all on public.commercial_public_plan_catalog to service_role;
grant all on public.commercial_public_pricing_policy to service_role;
grant all on public.commercial_public_pricing_versions to service_role;
grant usage, select on all sequences in schema public to service_role;

insert into public.commercial_public_plan_catalog(plan_key,sort_order,display_name,audience,price_mode,monthly_price_inr,annual_price_inr,onboarding_fee_inr,annual_label,highlights,included_modules,usage_allowances,support_tier,cta_label,cta_href,featured,public,status,effective_from,metadata)
values
('starter',10,'Starter','For emerging brands that want one intelligent place to understand the brand, plan growth, create content and see what is working.','fixed',14900,149000,0,'Pay for 10 months. Use for 12.','["One brand workspace","Brand intelligence & memory","AI strategy and content planning","Creative generation studio","SEO and content planning","Core reporting","Human approval workflows"]'::jsonb,'["brand_intelligence","strategy","creative","content","seo","reporting","approvals"]'::jsonb,'{"brands":1,"workspaces":1,"includedUsers":5,"aiUsage":"fair_use"}'::jsonb,'standard','Start Starter','/signup?plan=starter',false,true,'published',now(),'{"launchPricing":true}'::jsonb),
('growth',20,'Growth','For growth-stage businesses adding paid acquisition, lifecycle, deeper analytics and connected channel execution.','fixed',34900,349000,0,'Pay for 10 months. Use for 12.','["Everything in Starter","Paid-media planning & governed execution","Lifecycle journeys","Advanced SEO / AEO / GEO workflows","Analytics & attribution","On-demand executive reporting","10 included users"]'::jsonb,'["brand_intelligence","strategy","creative","content","seo","paid_media","lifecycle","analytics","reporting","approvals"]'::jsonb,'{"brands":1,"workspaces":2,"includedUsers":10,"aiUsage":"fair_use"}'::jsonb,'priority','Choose Growth','/signup?plan=growth',true,true,'published',now(),'{"launchPricing":true,"recommended":true}'::jsonb),
('commerce',30,'Commerce','For commerce brands connecting products, creative velocity, acquisition, revenue evidence and conversion learning.','fixed',69900,699000,0,'Pay for 10 months. Use for 12.','["Everything in Growth","Commerce & revenue evidence","Catalogue-aware growth intelligence","Higher creative throughput","Conversion journeys & attribution","Revenue-linked reporting","15 included users"]'::jsonb,'["brand_intelligence","strategy","creative","content","seo","paid_media","lifecycle","analytics","commerce","reporting","approvals"]'::jsonb,'{"brands":2,"workspaces":4,"includedUsers":15,"aiUsage":"enhanced_fair_use"}'::jsonb,'priority','Choose Commerce','/signup?plan=commerce',false,true,'published',now(),'{"launchPricing":true}'::jsonb),
('agency',40,'Agency','For agencies and multi-client operators that need separated workspaces, partner operations and client reporting at scale.','fixed',99900,999000,0,'Pay for 10 months. Use for 12.','["Multi-client operating system","Tenant-separated client workspaces","Role & approval control","Specialist / partner operations","Client reporting","Commercial controls","25 included operator users"]'::jsonb,'["multi_tenant","strategy","creative","content","paid_media","lifecycle","analytics","reporting","marketplace","commercial","approvals"]'::jsonb,'{"brands":10,"workspaces":20,"includedUsers":25,"aiUsage":"agency_fair_use"}'::jsonb,'priority','Start Agency','/signup?plan=agency',false,true,'published',now(),'{"launchPricing":true}'::jsonb),
('enterprise',50,'Enterprise','For larger organisations requiring deeper governance, custom controls, assurance and integration architecture.','from',149900,1499000,0,'Starting commercial. Annual contracts available.','["Everything in Growth / Commerce as contracted","Advanced access control","Custom approval policies","Enterprise integration architecture","Audit & evidence workflows","Dedicated onboarding","Commercial scope tailored to the organisation"]'::jsonb,'["enterprise_governance","custom_integrations","advanced_access","reporting","commercial","approvals"]'::jsonb,'{"brands":"contracted","workspaces":"contracted","includedUsers":"contracted","aiUsage":"contracted"}'::jsonb,'enterprise','Talk to Enterprise','/contact?interest=enterprise',false,true,'published',now(),'{"launchPricing":true,"startingPrice":true}'::jsonb),
('managed',60,'Managed Growth','For brands that want the Oye !magine platform plus an accountable operating team around it.','from',199900,1999000,0,'Starting retainer. Media spend is separate.','["Oye !magine platform access","Assigned growth operating team","Strategy, creative & campaign operations","Governed publishing & optimisation","Performance reporting","Specialist marketplace access","Monthly operating review"]'::jsonb,'["platform","managed_delivery","strategy","creative","paid_media","lifecycle","analytics","reporting","marketplace"]'::jsonb,'{"brands":"contracted","workspaces":"contracted","includedUsers":"contracted","aiUsage":"managed"}'::jsonb,'managed','Discuss Managed Growth','/contact?interest=managed',false,true,'published',now(),'{"launchPricing":true,"startingPrice":true}'::jsonb),
('white_label',70,'White Label','For partners that want to operate Oye !magine capabilities behind their own customer experience.','from',249900,2499000,149900,'Starting platform licence plus one-time implementation.','["Partner-branded customer experience","Separated downstream client tenants","Role, approval & reporting architecture","Provider abstraction","Commercial & operating controls","Partner onboarding and implementation","Custom commercial boundaries"]'::jsonb,'["white_label","multi_tenant","partner_operations","reporting","commercial","approvals"]'::jsonb,'{"brands":"contracted","workspaces":"contracted","includedUsers":"contracted","aiUsage":"contracted"}'::jsonb,'enterprise','Discuss White Label','/contact?interest=white-label',false,true,'published',now(),'{"launchPricing":true,"startingPrice":true}'::jsonb)
on conflict (plan_key) do update set
  sort_order=excluded.sort_order,display_name=excluded.display_name,audience=excluded.audience,price_mode=excluded.price_mode,
  monthly_price_inr=excluded.monthly_price_inr,annual_price_inr=excluded.annual_price_inr,onboarding_fee_inr=excluded.onboarding_fee_inr,
  annual_label=excluded.annual_label,highlights=excluded.highlights,included_modules=excluded.included_modules,usage_allowances=excluded.usage_allowances,
  support_tier=excluded.support_tier,cta_label=excluded.cta_label,cta_href=excluded.cta_href,featured=excluded.featured,public=excluded.public,status=excluded.status,
  effective_from=excluded.effective_from,metadata=excluded.metadata,updated_at=now();

insert into public.commercial_public_pricing_policy(policy_key,currency_code,currency_symbol,tax_label,annual_savings_label,media_spend_included,provider_pass_through_included,ai_fair_use_included,policy_copy,status,version)
values ('public_launch','INR','₹','GST extra as applicable','Pay for 10 months. Use for 12.',false,false,true,'{"mediaSpend":"Advertising/media spend is funded separately by the client and remains approval-bound.","passThrough":"Third-party usage, messaging, payment, eSign or other pass-through charges may apply where contracted.","ai":"Platform subscriptions include governed AI usage under the plan fair-use policy. Material overages or dedicated capacity are quoted before charge.","billing":"Monthly subscriptions renew monthly. Annual subscriptions are prepaid for 12 months at the published annual rate.","cancellation":"Cancellation, refunds and renewal rules follow the signed order form and master agreement."}'::jsonb,'published',1)
on conflict (policy_key) do update set currency_code=excluded.currency_code,currency_symbol=excluded.currency_symbol,tax_label=excluded.tax_label,annual_savings_label=excluded.annual_savings_label,media_spend_included=excluded.media_spend_included,provider_pass_through_included=excluded.provider_pass_through_included,ai_fair_use_included=excluded.ai_fair_use_included,policy_copy=excluded.policy_copy,status=excluded.status,updated_at=now();

commit;
