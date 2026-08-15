begin;

create or replace function private.tg_capture_ai_evolution_event()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $fn$
declare
  r jsonb := case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end;
  v_activity text := tg_argv[0];
  v_source_type text := tg_argv[1];
  v_tenant text;
  v_brand text;
  v_workspace text;
  v_source_id text;
  v_status text;
  v_channel text;
  v_language text;
begin
  if tg_op='DELETE' then return old; end if;
  v_tenant := nullif(coalesce(r->>'tenant_id',r->>'tenantId'),'');
  v_brand := nullif(coalesce(r->>'brand_id',r->>'brandId'),'');
  v_workspace := nullif(coalesce(r->>'workspace_id',r->>'workspaceId',r->>'workspace_key'),'');
  if v_tenant is null or v_workspace is null then return new; end if;

  v_source_id := coalesce(r->>'artifact_id',r->>'asset_id',r->>'job_id',r->>'campaign_id',r->>'plan_run_id',r->>'draft_id',r->>'fact_id',r->>'snapshot_id',r->>'id',md5(r::text));
  v_status := nullif(coalesce(r->>'status',r->>'state',r->>'approval_state'),'');
  v_channel := nullif(coalesce(r->>'channel',r->>'provider_channel'),'');
  v_language := coalesce(nullif(r->>'language',''),nullif(r->>'locale',''),'en');

  insert into public.ai_evolution_events(
    event_id,tenant_id,brand_id,workspace_id,activity_type,source_entity_type,source_entity_id,
    product_category,vertical,channel,language,intent,prompt_template_key,prompt_template_version,
    prompt_hash,provider,model,input_fingerprint,output_fingerprint,metadata,outcome_metrics,reuse_scope,
    sensitivity,contains_personal_data,contains_client_secrets,risk_class,actor_user_id,occurred_at
  ) values (
    concat('evt_',replace(gen_random_uuid()::text,'-','')),v_tenant,v_brand,v_workspace,v_activity,v_source_type,v_source_id,
    nullif(r->>'product_category',''),nullif(r->>'vertical',''),v_channel,
    case when v_language in ('en','hi','hinglish','other') then v_language else 'other' end,
    nullif(coalesce(r->>'intent',r->>'objective'),''),
    nullif(coalesce(r->>'prompt_template_key',r->>'template_key'),''),
    nullif(coalesce(r->>'prompt_template_version',r->>'template_version'),''),
    nullif(r->>'prompt_hash',''),nullif(r->>'provider',''),nullif(r->>'model',''),
    nullif(coalesce(r->>'input_fingerprint',r->>'request_hash'),'') , md5(r::text),
    jsonb_strip_nulls(jsonb_build_object(
      'sourceTable',tg_table_name,'operation',tg_op,'status',v_status,'assetType',r->>'asset_type',
      'campaignType',r->>'campaign_type','metricKey',r->>'metric_key','approvalState',r->>'approval_state'
    )),
    case when r ? 'metrics' and jsonb_typeof(r->'metrics')='array' then r->'metrics' else '[]'::jsonb end,
    'tenant_private','internal',false,false,
    case when v_activity in ('campaign_executed','financial_action','outbound_message') then 'high' else 'low' end,
    nullif(coalesce(r->>'actor_user_id',r->>'created_by',r->>'updated_by'),'') ,now()
  );
  return new;
exception when others then
  -- Learning telemetry must never block the customer transaction.
  return new;
end;
$fn$;
revoke all on function private.tg_capture_ai_evolution_event() from public,anon,authenticated;

do $do$
declare spec record;
begin
  for spec in select * from (values
    ('strategy_artifacts','strategy_generated','strategy'),
    ('creative_generation_jobs','creative_generated','creative_generation'),
    ('creative_assets','creative_asset_changed','creative_asset'),
    ('campaign_drafts','campaign_designed','campaign'),
    ('content_plan_runs','content_plan_generated','content_plan'),
    ('landing_page_drafts','landing_page_generated','landing_page'),
    ('reporting_snapshot_runs','report_generated','report'),
    ('provider_normalized_facts','performance_observed','performance_fact')
  ) as s(table_name,activity,source_type)
  loop
    if to_regclass('public.'||spec.table_name) is not null then
      execute format('drop trigger if exists %I on public.%I','trg_'||spec.table_name||'_evolution',spec.table_name);
      execute format('create trigger %I after insert or update on public.%I for each row execute function private.tg_capture_ai_evolution_event(%L,%L)','trg_'||spec.table_name||'_evolution',spec.table_name,spec.activity,spec.source_type);
    end if;
  end loop;
end
$do$;

create or replace function private.refresh_ai_learning_patterns()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $fn$
declare
  v_candidates integer := 0;
  v_activated integer := 0;
begin
  with aggregates as (
    select
      coalesce(vertical,'unknown') as vertical,
      coalesce(product_category,'unknown') as product_category,
      coalesce(channel,'unknown') as channel,
      activity_type,
      coalesce(prompt_template_key,'none') as template_key,
      coalesce(prompt_template_version,'none') as template_version,
      count(*)::integer as sample_count,
      count(distinct tenant_id)::integer as tenant_count,
      max(occurred_at) as last_seen
    from public.ai_evolution_events
    where occurred_at >= now()-interval '180 days'
      and contains_personal_data=false
      and contains_client_secrets=false
      and sensitivity in ('public','internal')
      and risk_class in ('low','medium')
    group by 1,2,3,4,5,6
    having count(*) >= 12 and count(distinct tenant_id) >= 3
  ), upserted as (
    insert into public.ai_learning_patterns(
      pattern_id,pattern_key,title,summary,vertical,product_category,channel,pattern_payload,
      evidence_event_ids,distinct_tenant_count,sample_count,confidence,reuse_scope,sensitivity,risk_class,status,last_evaluated_at,updated_at
    )
    select
      concat('pattern_',md5(concat_ws('|',vertical,product_category,channel,activity_type,template_key,template_version))),
      concat_ws('|',vertical,product_category,channel,activity_type,template_key,template_version),
      concat(initcap(replace(activity_type,'_',' ')),' · ',product_category,' · ',channel),
      concat('An anonymised operating pattern observed across ',tenant_count,' tenants and ',sample_count,' governed events.'),
      nullif(vertical,'unknown'),nullif(product_category,'unknown'),nullif(channel,'unknown'),
      jsonb_build_object('activityType',activity_type,'templateKey',nullif(template_key,'none'),'templateVersion',nullif(template_version,'none'),'lastSeen',last_seen),
      '[]'::jsonb,tenant_count,sample_count,least(0.95::numeric,(sample_count::numeric/50.0)),
      'platform_anonymized','internal','low',
      case when tenant_count>=5 and sample_count>=25 then 'active' else 'candidate' end,
      now(),now()
    from aggregates
    on conflict(pattern_key,tenant_id,workspace_id,reuse_scope) do update set
      distinct_tenant_count=excluded.distinct_tenant_count,sample_count=excluded.sample_count,
      confidence=excluded.confidence,pattern_payload=excluded.pattern_payload,summary=excluded.summary,
      status=excluded.status,last_evaluated_at=now(),updated_at=now()
    returning status
  )
  select count(*) filter(where status='candidate'),count(*) filter(where status='active') into v_candidates,v_activated from upserted;

  insert into public.ai_pattern_evaluations(pattern_id,evaluation_type,score,passed,evidence,evaluator)
  select pattern_id,'privacy',1.0,true,jsonb_build_object('rule','aggregate_only_no_personal_or_secret_events','minimumTenants',distinct_tenant_count,'sampleCount',sample_count),'oye_privacy_rule_engine'
  from public.ai_learning_patterns p
  where p.reuse_scope='platform_anonymized' and p.status in ('candidate','active')
    and not exists(select 1 from public.ai_pattern_evaluations e where e.pattern_id=p.pattern_id and e.evaluation_type='privacy' and e.passed=true);

  return jsonb_build_object('candidatePatterns',v_candidates,'activePatterns',v_activated,'refreshedAt',now());
end;
$fn$;
revoke all on function private.refresh_ai_learning_patterns() from public,anon,authenticated;
grant execute on function private.refresh_ai_learning_patterns() to service_role;

commit;