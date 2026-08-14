do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'extensions') then
    execute 'create extension if not exists vector with schema extensions';
  else
    execute 'create extension if not exists vector';
  end if;
end $$;
