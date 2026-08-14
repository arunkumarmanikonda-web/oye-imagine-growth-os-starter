begin;
insert into public.core_brands (brand_id,tenant_id,display_name,legal_entity_name,website_url,status,metadata) values
('brand_oye_imagine','tenant_oye_internal','Oye !magine','Oye Imagine Private Limited','https://www.oyeimagine.com','active','{"source":"canonical_platform_identity"}'::jsonb),
('brand_neejee','tenant_neejee','Neejee',null,'https://neejee.com','active','{"source":"controlled_reference_pilot"}'::jsonb)
on conflict (brand_id) do update set display_name=excluded.display_name,website_url=excluded.website_url,updated_at=now();

insert into public.core_workspaces (workspace_id,tenant_id,brand_id,business_group,geography_code,language_code,currency_code,autonomy_level,status,metadata) values
('workspace_oye_internal','tenant_oye_internal','brand_oye_imagine','Oye !magine','IN','en','INR',0,'active','{"source":"canonical_platform_identity"}'::jsonb),
('workspace_neejee','tenant_neejee','brand_neejee','Neejee','IN','en','INR',0,'active','{"source":"controlled_reference_pilot"}'::jsonb)
on conflict (workspace_id) do update set brand_id=excluded.brand_id,status='active',updated_at=now();

insert into public.agent_autonomy_policies (tenant_id,workspace_id,agent_key,autonomy_level,allowed_tool_classes,max_run_cost_usd,max_tool_calls,metadata) values
('tenant_oye_internal','workspace_oye_internal','brand-strategist',1,'["read","draft_write"]'::jsonb,0.25,4,'{"default":"lowest_safe_bounded_agent"}'::jsonb),
('tenant_neejee','workspace_neejee','brand-strategist',1,'["read","draft_write"]'::jsonb,0.25,4,'{"default":"controlled_pilot"}'::jsonb)
on conflict (tenant_id,workspace_id,agent_key) do nothing;
commit;
