create extension if not exists pgcrypto;

create table if not exists public.marketplace_services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  description text not null,
  pricing_model text not null check (pricing_model in ('fixed','hourly','retainer','milestone')),
  price_label text not null,
  active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_requests (
  id uuid primary key default gen_random_uuid(),
  service_id uuid null references public.marketplace_services(id) on delete set null,
  service_slug text null,
  full_name text not null,
  email text not null,
  company_name text null,
  phone text null,
  website text null,
  budget_range text null,
  brief text not null,
  status text not null default 'submitted' check (status in ('submitted','reviewing','assigned','closed','rejected')),
  source text not null default 'marketplace',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_marketplace_services_active_sort
  on public.marketplace_services(active, sort_order, title);

create index if not exists idx_marketplace_requests_status_created
  on public.marketplace_requests(status, created_at desc);

alter table public.marketplace_services enable row level security;
alter table public.marketplace_requests enable row level security;

insert into public.marketplace_services (slug, title, category, description, pricing_model, price_label, active, sort_order)
values
  ('seo-audit', 'SEO Audit', 'SEO', 'Technical audit, keyword gap review, indexation checks and action plan.', 'fixed', 'From ?15,000', true, 10),
  ('landing-page-build', 'Landing Page Build', 'Web', 'Conversion-focused campaign page design, copy, QA and handoff.', 'fixed', 'From ?25,000', true, 20),
  ('meta-google-campaign-setup', 'Meta + Google Campaign Setup', 'Paid Media', 'Audience, tracking, campaign structure and launch-ready draft setup.', 'fixed', 'From ?30,000', true, 30),
  ('creative-production', 'Creative Production', 'Creative', 'Static creatives, carousels and ad variants aligned to brand guardrails.', 'retainer', 'From ?40,000 / month', true, 40),
  ('growth-ops-retainer', 'Growth Ops Retainer', 'Managed Services', 'Monthly operating rhythm across strategy, approvals, reporting and optimisation.', 'retainer', 'From ?75,000 / month', true, 50)
on conflict (slug) do update
set
  title = excluded.title,
  category = excluded.category,
  description = excluded.description,
  pricing_model = excluded.pricing_model,
  price_label = excluded.price_label,
  active = excluded.active,
  sort_order = excluded.sort_order,
  updated_at = now();
