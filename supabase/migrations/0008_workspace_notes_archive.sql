alter table if exists public.workspace_notes
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by_user_id uuid,
  add column if not exists archived_by_email text;

create index if not exists idx_workspace_notes_archived_at
  on public.workspace_notes(archived_at);

create index if not exists idx_workspace_notes_workspace_active
  on public.workspace_notes(workspace_id, archived_at, updated_at desc);