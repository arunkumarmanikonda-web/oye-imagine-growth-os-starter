insert into public.config_provider_secret_fields (
  provider_key, field_key, label, field_type, required, sensitive, help_text, sort_order
) values
  ('google_oauth','GOOGLE_ADS_DEVELOPER_TOKEN','Google Ads developer token','secret',false,true,'Platform developer token required for Google Ads discovery, sync and mutation. Store once at platform level.',40),
  ('google_oauth','GOOGLE_ADS_LOGIN_CUSTOMER_ID','Google Ads manager customer ID','text',false,false,'Optional manager account ID used as the login-customer-id header for managed client accounts.',50),
  ('google_oauth','GOOGLE_ADS_API_VERSION','Google Ads API version','text',false,false,'Optional API version override. Leave blank to use the application default.',60)
on conflict (provider_key,field_key) do update set
  label=excluded.label,
  field_type=excluded.field_type,
  required=excluded.required,
  sensitive=excluded.sensitive,
  help_text=excluded.help_text,
  sort_order=excluded.sort_order;
