begin;

create table if not exists public.public_contact_enquiries (
  enquiry_id text primary key,
  full_name text not null,
  company_name text,
  email text not null,
  phone text,
  interest text not null,
  message text not null,
  preferred_language text not null default 'en' check (preferred_language in ('en','hi')),
  consent_to_contact boolean not null default false,
  status text not null default 'new' check (status in ('new','qualified','in_progress','converted','closed','spam')),
  assigned_user_id text,
  source_path text,
  source_context jsonb not null default '{}'::jsonb,
  request_fingerprint text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_public_contact_enquiries_status on public.public_contact_enquiries(status,created_at desc);
create index if not exists idx_public_contact_enquiries_email on public.public_contact_enquiries(lower(email),created_at desc);

alter table public.public_contact_enquiries enable row level security;
revoke all on public.public_contact_enquiries from anon, authenticated;
grant all on public.public_contact_enquiries to service_role;

commit;
