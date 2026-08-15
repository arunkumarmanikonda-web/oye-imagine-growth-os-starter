begin;

create or replace function private.tg_sync_ai_global_search()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $fn$
declare
  r jsonb := case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end;
  v_domain text := tg_argv[0];
  v_link text := tg_argv[1];
  v_id text;
  v_tenant text;
  v_workspace text;
  v_scope text;
  v_title text;
  v_summary text;
  v_body text;
  v_document_id text;
begin
  v_id := coalesce(
    r->>'document_id', r->>'artifact_id', r->>'asset_id', r->>'campaign_id', r->>'plan_run_id',
    r->>'request_id', r->>'invoice_id', r->>'subscription_id', r->>'node_id', r->>'workspace_id',
    r->>'slug', r->>'id', md5(r::text)
  );
  v_tenant := nullif(coalesce(r->>'tenant_id', r->>'tenantId'), '');
  v_workspace := nullif(coalesce(r->>'workspace_id', r->>'workspaceId', r->>'workspace_key'), '');
  v_scope := case when v_tenant is null then 'platform_public' when v_workspace is null then 'tenant' else 'workspace' end;
  v_document_id := concat('idx:', tg_table_name, ':', v_id);

  if tg_op='DELETE' then
    delete from public.ai_global_search_documents where document_id=v_document_id;
    return old;
  end if;

  v_title := coalesce(
    nullif(r->>'title',''), nullif(r->>'name',''), nullif(r->>'display_name',''), nullif(r->>'subject',''),
    nullif(r->>'invoice_number',''), nullif(r->>'request_type',''), nullif(r->>'slug',''), initcap(replace(v_domain,'_',' '))
  );
  v_summary := left(coalesce(
    nullif(r->>'summary',''), nullif(r->>'description',''), nullif(r->>'status',''), nullif(r->>'source_type',''),
    nullif(r->>'content_type',''), ''
  ), 900);
  v_body := left(concat_ws(' ',
    nullif(r->>'body',''), nullif(r->>'content',''), nullif(r->>'objective',''), nullif(r->>'strategy_summary',''),
    nullif(r->>'brief',''), nullif(r->>'recommendation',''), nullif(r->>'status',''), nullif(r->>'channel',''),
    nullif(r->>'provider_type',''), nullif(r->>'service_key',''), nullif(r->>'invoice_number','')
  ), 8000);

  insert into public.ai_global_search_documents(
    document_id,scope_type,tenant_id,workspace_id,domain,title,summary,body,deep_link,action_key,keywords,metadata,created_at,updated_at
  ) values (
    v_document_id,v_scope,v_tenant,v_workspace,v_domain,v_title,v_summary,v_body,
    case when v_link is null or v_link='' then null else v_link end,
    null,'[]'::jsonb,jsonb_build_object('sourceTable',tg_table_name,'sourceId',v_id),
    coalesce((r->>'created_at')::timestamptz,now()),now()
  )
  on conflict (document_id) do update set
    scope_type=excluded.scope_type,tenant_id=excluded.tenant_id,workspace_id=excluded.workspace_id,
    domain=excluded.domain,title=excluded.title,summary=excluded.summary,body=excluded.body,
    deep_link=excluded.deep_link,metadata=excluded.metadata,updated_at=now();
  return new;
exception when others then
  -- Search indexing must never block the business transaction. Observability can surface missed indexing.
  return case when tg_op='DELETE' then old else new end;
end;
$fn$;

revoke all on function private.tg_sync_ai_global_search() from public, anon, authenticated;

-- CMS public pages are safe platform-public search material after publication.
create or replace function private.tg_sync_cms_page_search()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $fn$
declare
  v_document_id text := concat('idx:cms_pages:', coalesce(new.slug,old.slug));
  v_body text;
begin
  if tg_op='DELETE' or new.status <> 'published' then
    delete from public.ai_global_search_documents where document_id=v_document_id;
    return case when tg_op='DELETE' then old else new end;
  end if;
  v_body := left(concat_ws(' ', new.title, new.audience, new.page_type, new.data::text), 10000);
  insert into public.ai_global_search_documents(document_id,scope_type,domain,title,summary,body,deep_link,keywords,metadata,created_at,updated_at)
  values(v_document_id,'platform_public','cms',new.title,coalesce(new.seo->>'description',''),v_body,concat('/',new.slug),'[]'::jsonb,jsonb_build_object('sourceTable','cms_pages','sourceId',new.slug),new.created_at,now())
  on conflict(document_id) do update set title=excluded.title,summary=excluded.summary,body=excluded.body,deep_link=excluded.deep_link,metadata=excluded.metadata,updated_at=now();
  return new;
end;
$fn$;
revoke all on function private.tg_sync_cms_page_search() from public, anon, authenticated;

drop trigger if exists trg_cms_pages_global_search on public.cms_pages;
create trigger trg_cms_pages_global_search after insert or update or delete on public.cms_pages for each row execute function private.tg_sync_cms_page_search();

-- Register safe searchable operational tables only when they exist.
do $do$
declare spec record;
begin
  for spec in select * from (values
    ('brand_memory_documents','brand_knowledge','/admin/brand-intelligence'),
    ('strategy_artifacts','strategy','/admin/execution-plan'),
    ('creative_assets','creative','/admin/creative'),
    ('campaign_drafts','campaigns','/admin/execution-plan'),
    ('content_plan_runs','seo','/admin/content'),
    ('integration_accounts','integrations','/admin/integrations'),
    ('commercial_invoices','commercial','/admin/commercial'),
    ('commercial_subscriptions','commercial','/admin/commercial'),
    ('marketplace_requests','marketplace','/admin/marketplace'),
    ('workspace_settings','configuration','/workspace')
  ) as s(table_name,domain_name,deep_link)
  loop
    if to_regclass('public.'||spec.table_name) is not null then
      execute format('drop trigger if exists %I on public.%I', 'trg_'||spec.table_name||'_global_search', spec.table_name);
      execute format(
        'create trigger %I after insert or update or delete on public.%I for each row execute function private.tg_sync_ai_global_search(%L,%L)',
        'trg_'||spec.table_name||'_global_search', spec.table_name, spec.domain_name, spec.deep_link
      );
    end if;
  end loop;
end
$do$;

-- Seed navigation/configuration help documents. These contain no secrets.
insert into public.ai_global_search_documents(document_id,scope_type,domain,title,summary,body,deep_link,action_key,keywords,metadata)
select concat('idx:permission:',permission_key),'platform_public','configuration',label,description,
       concat(category,' ',label,' ',description,' permission ',permission_key),
       case
         when permission_key like 'platform.%' then '/admin/access-control'
         when permission_key like 'brand.%' then '/admin/brand-intelligence'
         when permission_key like 'creative.%' then '/admin/creative'
         when permission_key like 'campaign.%' then '/admin/execution-plan'
         when permission_key like 'integration.%' then '/admin/integrations'
         when permission_key like 'finance.%' or permission_key like 'invoice.%' or permission_key like 'subscription.%' then '/admin/commercial'
         when permission_key like 'marketplace.%' then '/admin/marketplace'
         when permission_key like 'privacy.%' then '/admin/privacy'
         when permission_key like 'reporting.%' or permission_key like 'analytics.%' then '/admin/campaign-summary'
         else '/workspace'
       end,
       permission_key,jsonb_build_array(permission_key,category,label),jsonb_build_object('sourceTable','core_permission_catalog','riskClass',risk_class)
from public.core_permission_catalog
on conflict(document_id) do update set title=excluded.title,summary=excluded.summary,body=excluded.body,deep_link=excluded.deep_link,action_key=excluded.action_key,keywords=excluded.keywords,metadata=excluded.metadata,updated_at=now();

-- Backfill published CMS pages.
insert into public.ai_global_search_documents(document_id,scope_type,domain,title,summary,body,deep_link,keywords,metadata,created_at,updated_at)
select concat('idx:cms_pages:',slug),'platform_public','cms',title,coalesce(seo->>'description',''),left(concat_ws(' ',title,audience,page_type,data::text),10000),concat('/',slug),'[]'::jsonb,jsonb_build_object('sourceTable','cms_pages','sourceId',slug),created_at,now()
from public.cms_pages where status='published'
on conflict(document_id) do update set title=excluded.title,summary=excluded.summary,body=excluded.body,deep_link=excluded.deep_link,metadata=excluded.metadata,updated_at=now();

commit;