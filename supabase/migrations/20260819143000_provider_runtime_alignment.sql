begin;

-- Provider activation truth must match the runtime contract. OAuth application
-- credentials are required for activation even when individual fields may be
-- supplied by the deployment environment instead of the encrypted Provider Vault.
update public.config_provider_secret_fields
set required = true,
    updated_at = now()
where provider_key = 'meta_marketing'
  and field_key in (
    'META_GRAPH_API_VERSION',
    'META_APP_ID',
    'META_APP_SECRET',
    'META_OAUTH_REDIRECT_URI'
  );

update public.config_provider_secret_fields
set required = true,
    updated_at = now()
where provider_key = 'linkedin_marketing'
  and field_key in (
    'LINKEDIN_API_VERSION',
    'LINKEDIN_CLIENT_ID',
    'LINKEDIN_CLIENT_SECRET',
    'LINKEDIN_OAUTH_REDIRECT_URI'
  );

insert into public.config_provider_definitions(
  provider_key,
  display_name,
  provider_category,
  capabilities,
  adapter_key,
  client_visible,
  healthcheck_strategy,
  metadata
)
values (
  'whatsapp_cloud',
  'WhatsApp Cloud',
  'whatsapp',
  '["whatsapp"]'::jsonb,
  'whatsapp_cloud',
  false,
  'credential_validation',
  '{"managedBy":"super_admin","provider":"meta","sendRuntime":"whatsapp_cloud"}'::jsonb
)
on conflict (provider_key) do update set
  display_name = excluded.display_name,
  provider_category = excluded.provider_category,
  capabilities = excluded.capabilities,
  adapter_key = excluded.adapter_key,
  client_visible = false,
  healthcheck_strategy = excluded.healthcheck_strategy,
  metadata = excluded.metadata,
  enabled = true,
  updated_at = now();

insert into public.config_provider_secret_fields(
  provider_key,
  field_key,
  label,
  field_type,
  required,
  sensitive,
  help_text,
  sort_order
)
values
  ('whatsapp_cloud','WHATSAPP_CLOUD_ACCESS_TOKEN','Cloud API access token','secret',true,true,'Server-side access token used only for governed WhatsApp sends.',10),
  ('whatsapp_cloud','WHATSAPP_CLOUD_PHONE_NUMBER_ID','Phone number ID','text',true,false,'Meta WhatsApp Business phone number ID used for Cloud API sends.',20),
  ('whatsapp_cloud','WHATSAPP_GRAPH_VERSION','Graph API version','text',true,false,'Pinned Graph API version, for example v23.0.',30),
  ('whatsapp_cloud','WHATSAPP_GRAPH_BASE_URL','Graph API base URL','url',false,false,'Optional override. Defaults to https://graph.facebook.com.',40),
  ('whatsapp_cloud','WHATSAPP_CLOUD_APP_SECRET','Webhook app secret','secret',false,true,'Optional dedicated webhook signing secret. Meta App Secret remains an allowed fallback.',50),
  ('whatsapp_cloud','WHATSAPP_WEBHOOK_VERIFY_TOKEN','Webhook verify token','secret',false,true,'Webhook subscription verification token. Required for webhook activation, not for send credential readiness.',60),

  ('fast2sms','FAST2SMS_API_URL','API URL','url',false,false,'Optional API endpoint override. Governed delivery uses the Fast2SMS default when absent.',20),
  ('fast2sms','FAST2SMS_ROUTE','Route','text',false,false,'Optional Fast2SMS route.',30),
  ('fast2sms','FAST2SMS_SENDER_ID','Sender ID','text',false,false,'Optional DLT sender ID.',40),
  ('fast2sms','FAST2SMS_ENTITY_ID','DLT entity ID','text',false,false,'Optional DLT entity identifier.',50),
  ('fast2sms','FAST2SMS_TEMPLATE_ID','DLT template ID','text',false,false,'Optional DLT template identifier.',60),

  ('aisensy','AISENSY_CAMPAIGN_NAME','Campaign name','text',true,false,'Approved AiSensy campaign/template name used when AiSensy is selected as WhatsApp fallback.',20),
  ('aisensy','AISENSY_CAMPAIGN_ENDPOINT','Campaign endpoint','url',false,false,'Optional endpoint override. Defaults to the AiSensy campaign v2 API.',30),
  ('aisensy','AISENSY_SOURCE','Source','text',false,false,'Optional source label sent to AiSensy.',40)
on conflict (provider_key, field_key) do update set
  label = excluded.label,
  field_type = excluded.field_type,
  required = excluded.required,
  sensitive = excluded.sensitive,
  help_text = excluded.help_text,
  sort_order = excluded.sort_order;

-- Governed lifecycle routing now reflects the actual production sender.
-- AiSensy remains available as a controlled fallback when configured.
update public.config_capability_routes
set primary_provider_key = 'whatsapp_cloud',
    fallback_provider_keys = '["aisensy"]'::jsonb,
    routing_policy = '{"consentRequired":true,"templatePolicyRequired":true,"approvalAction":"lifecycle.send","providerAuthorityRequired":true}'::jsonb,
    updated_at = now()
where capability_key = 'whatsapp.send'
  and purpose = 'lifecycle';

commit;
