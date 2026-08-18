insert into public.config_provider_definitions (
  provider_key, display_name, provider_category, capabilities, documentation_url,
  account_creation_url, enabled, client_visible, adapter_key, adapter_version,
  healthcheck_strategy, metadata
) values
  (
    'meta_marketing','Meta Business','social',
    '["facebook.publish","instagram.publish","instagram.reels","instagram.stories"]'::jsonb,
    'https://www.postman.com/meta/','https://developers.facebook.com/apps/',true,false,
    'meta_graph','v1','account_connection_validation',
    '{"credential_scope":"tenant_workspace","requires_page_access_token":true,"instagram_requires_professional_account":true}'::jsonb
  ),
  (
    'linkedin_marketing','LinkedIn','social',
    '["linkedin.organization.publish"]'::jsonb,
    'https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api',
    'https://www.linkedin.com/developers/apps',true,false,
    'linkedin_posts','v1','account_connection_validation',
    '{"credential_scope":"tenant_workspace","required_permission":"w_organization_social","api_path":"/rest/posts"}'::jsonb
  )
on conflict (provider_key) do update set
  display_name=excluded.display_name,
  provider_category=excluded.provider_category,
  capabilities=excluded.capabilities,
  documentation_url=excluded.documentation_url,
  account_creation_url=excluded.account_creation_url,
  enabled=excluded.enabled,
  adapter_key=excluded.adapter_key,
  adapter_version=excluded.adapter_version,
  healthcheck_strategy=excluded.healthcheck_strategy,
  metadata=excluded.metadata,
  updated_at=now();

-- Platform app fields are optional until managed OAuth is enabled. Brand/page
-- versions, IDs and access tokens live in tenant/workspace integration accounts.
insert into public.config_provider_secret_fields (
  provider_key, field_key, label, field_type, required, sensitive, help_text, sort_order
) values
  ('meta_marketing','META_GRAPH_API_VERSION','Default Graph API version','text',false,false,'Optional platform default. Connected accounts persist the provider version that was actually verified.',10),
  ('meta_marketing','META_APP_ID','Meta App ID','text',false,false,'Platform Meta app identifier. Required only when managed OAuth onboarding is enabled.',20),
  ('meta_marketing','META_APP_SECRET','Meta App secret','secret',false,true,'Platform Meta app secret. Never stores a client Page access token.',30),
  ('meta_marketing','META_OAUTH_REDIRECT_URI','Meta OAuth redirect URI','url',false,false,'Platform OAuth callback used for managed Meta account connection.',40),
  ('linkedin_marketing','LINKEDIN_API_VERSION','Default LinkedIn API version','text',false,false,'Optional platform default. Connected accounts persist the YYYYMM version that was actually verified.',10),
  ('linkedin_marketing','LINKEDIN_CLIENT_ID','LinkedIn Client ID','text',false,false,'Platform LinkedIn OAuth client identifier.',20),
  ('linkedin_marketing','LINKEDIN_CLIENT_SECRET','LinkedIn Client secret','secret',false,true,'Platform LinkedIn OAuth client secret. Never stores an organisation access token.',30),
  ('linkedin_marketing','LINKEDIN_OAUTH_REDIRECT_URI','LinkedIn OAuth redirect URI','url',false,false,'Platform OAuth callback used for managed LinkedIn account connection.',40)
on conflict (provider_key,field_key) do update set
  label=excluded.label,
  field_type=excluded.field_type,
  required=excluded.required,
  sensitive=excluded.sensitive,
  help_text=excluded.help_text,
  sort_order=excluded.sort_order;

delete from public.config_provider_secret_fields
where (provider_key='meta_marketing' and field_key in ('META_PAGE_ACCESS_TOKEN','META_FACEBOOK_PAGE_ID','META_INSTAGRAM_USER_ID'))
   or (provider_key='linkedin_marketing' and field_key in ('LINKEDIN_ACCESS_TOKEN','LINKEDIN_AUTHOR_URN'));

insert into public.config_capability_routes (
  route_id, capability_key, purpose, primary_provider_key, fallback_provider_keys,
  routing_policy, client_label, client_provider_disclosure, enabled
) values
  ('route_social_facebook','social.publish','facebook','meta_marketing','[]'::jsonb,'{"fail_closed":true,"credential_scope":"tenant_workspace"}'::jsonb,'Oye !magine',false,true),
  ('route_social_instagram','social.publish','instagram','meta_marketing','[]'::jsonb,'{"fail_closed":true,"credential_scope":"tenant_workspace"}'::jsonb,'Oye !magine',false,true),
  ('route_social_linkedin','social.publish','linkedin','linkedin_marketing','[]'::jsonb,'{"fail_closed":true,"credential_scope":"tenant_workspace"}'::jsonb,'Oye !magine',false,true),
  ('route_social_youtube','social.publish','youtube','google_oauth','[]'::jsonb,'{"fail_closed":true,"credential_scope":"tenant_workspace"}'::jsonb,'Oye !magine',false,true)
on conflict (route_id) do update set
  capability_key=excluded.capability_key,
  purpose=excluded.purpose,
  primary_provider_key=excluded.primary_provider_key,
  fallback_provider_keys=excluded.fallback_provider_keys,
  routing_policy=excluded.routing_policy,
  enabled=excluded.enabled,
  updated_at=now();
