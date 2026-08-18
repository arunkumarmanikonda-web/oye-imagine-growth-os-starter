insert into public.config_provider_definitions (
  provider_key, display_name, provider_category, capabilities, documentation_url,
  account_creation_url, enabled, client_visible, adapter_key, adapter_version,
  healthcheck_strategy, metadata
) values
  (
    'meta_marketing','Meta Business','social',
    '["facebook.publish","instagram.publish","instagram.reels","instagram.stories"]'::jsonb,
    'https://www.postman.com/meta/','https://developers.facebook.com/apps/',true,false,
    'meta_graph','v1','credential_validation',
    '{"requires_page_access_token":true,"instagram_requires_professional_account":true}'::jsonb
  ),
  (
    'linkedin_marketing','LinkedIn','social',
    '["linkedin.organization.publish"]'::jsonb,
    'https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api',
    'https://www.linkedin.com/developers/apps',true,false,
    'linkedin_posts','v1','credential_validation',
    '{"required_permission":"w_organization_social","api_path":"/rest/posts"}'::jsonb
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

insert into public.config_provider_secret_fields (
  provider_key, field_key, label, field_type, required, sensitive, help_text, sort_order
) values
  ('meta_marketing','META_GRAPH_API_VERSION','Graph API version','text',true,false,'Use the active Graph API version configured for the Meta app.',10),
  ('meta_marketing','META_PAGE_ACCESS_TOKEN','Page access token','secret',true,true,'Page token with the permissions required for the connected Facebook Page and linked Instagram professional account.',20),
  ('meta_marketing','META_FACEBOOK_PAGE_ID','Facebook Page ID','text',true,false,'The Page to publish Facebook content on behalf of.',30),
  ('meta_marketing','META_INSTAGRAM_USER_ID','Instagram professional account ID','text',true,false,'The Instagram professional account connected for publishing.',40),
  ('linkedin_marketing','LINKEDIN_ACCESS_TOKEN','Access token','secret',true,true,'OAuth token authorized for organization publishing.',10),
  ('linkedin_marketing','LINKEDIN_AUTHOR_URN','Organization author URN','text',true,false,'Example: urn:li:organization:1234567',20),
  ('linkedin_marketing','LINKEDIN_API_VERSION','LinkedIn API version','text',true,false,'YYYYMM version header; use a currently supported Marketing API version.',30)
on conflict (provider_key,field_key) do update set
  label=excluded.label,
  field_type=excluded.field_type,
  required=excluded.required,
  sensitive=excluded.sensitive,
  help_text=excluded.help_text,
  sort_order=excluded.sort_order;

insert into public.config_capability_routes (
  route_id, capability_key, purpose, primary_provider_key, fallback_provider_keys,
  routing_policy, client_label, client_provider_disclosure, enabled
) values
  ('route_social_facebook','social.publish','facebook','meta_marketing','[]'::jsonb,'{"fail_closed":true}'::jsonb,'Oye !magine',false,true),
  ('route_social_instagram','social.publish','instagram','meta_marketing','[]'::jsonb,'{"fail_closed":true}'::jsonb,'Oye !magine',false,true),
  ('route_social_linkedin','social.publish','linkedin','linkedin_marketing','[]'::jsonb,'{"fail_closed":true}'::jsonb,'Oye !magine',false,true)
on conflict (route_id) do update set
  capability_key=excluded.capability_key,
  purpose=excluded.purpose,
  primary_provider_key=excluded.primary_provider_key,
  fallback_provider_keys=excluded.fallback_provider_keys,
  routing_policy=excluded.routing_policy,
  enabled=excluded.enabled,
  updated_at=now();