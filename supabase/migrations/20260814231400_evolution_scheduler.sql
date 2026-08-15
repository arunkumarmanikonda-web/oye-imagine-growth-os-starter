begin;

do $do$
begin
  if not exists(select 1 from pg_extension where extname='pg_cron') then
    begin
      execute 'create extension if not exists pg_cron';
    exception when others then
      null;
    end;
  end if;

  if exists(select 1 from pg_extension where extname='pg_cron') then
    begin
      execute $sql$select cron.schedule('oye-ai-learning-refresh','15 * * * *','select private.refresh_ai_learning_patterns();')$sql$;
    exception when others then
      -- Some managed environments expose pg_cron but restrict scheduling during migration.
      -- The function remains callable by the trusted service-role scheduler.
      null;
    end;
  end if;
end
$do$;

commit;