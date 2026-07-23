create table if not exists public.marketplace_specialists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  full_name text not null,
  title text not null,
  primary_category text not null,
  bio text not null,
  skills text[] not null default '{}',
  languages text[] not null default '{}',
  verified boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_marketplace_specialists_active_sort
  on public.marketplace_specialists(active, sort_order, full_name);

alter table public.marketplace_specialists enable row level security;

insert into public.marketplace_specialists
  (slug, full_name, title, primary_category, bio, skills, languages, verified, active, sort_order)
values
  (
    'ananya-seo',
    'Ananya Sharma',
    'Senior SEO Strategist',
    'SEO',
    'Technical SEO, content clustering and search visibility strategy for growth-stage brands.',
    array['Technical SEO','Content Strategy','Search Console','Keyword Research'],
    array['English','Hindi'],
    true,
    true,
    10
  ),
  (
    'rahul-performance',
    'Rahul Verma',
    'Performance Marketing Specialist',
    'Paid Media',
    'Google Ads and Meta Ads operator focused on CAC, ROAS and landing-page alignment.',
    array['Google Ads','Meta Ads','Attribution','Funnel Optimisation'],
    array['English','Hindi'],
    true,
    true,
    20
  ),
  (
    'meera-creative',
    'Meera Iyer',
    'Creative Strategist',
    'Creative',
    'Ad creative systems, campaign concepts, static variations and performance-oriented messaging.',
    array['Creative Strategy','Ad Copy','Static Creatives','Campaign Concepts'],
    array['English','Hindi','Tamil'],
    false,
    true,
    30
  )
on conflict (slug) do update
set
  full_name = excluded.full_name,
  title = excluded.title,
  primary_category = excluded.primary_category,
  bio = excluded.bio,
  skills = excluded.skills,
  languages = excluded.languages,
  verified = excluded.verified,
  active = excluded.active,
  sort_order = excluded.sort_order,
  updated_at = now();
