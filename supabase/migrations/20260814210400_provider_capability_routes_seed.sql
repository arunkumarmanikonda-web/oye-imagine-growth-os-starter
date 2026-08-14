begin;

insert into public.config_capability_routes(
  route_id,
  capability_key,
  purpose,
  primary_provider_key,
  fallback_provider_keys,
  routing_policy,
  client_label,
  client_provider_disclosure,
  enabled
)
values
  ('route_ai_copy','ai.generate','copy','openai','["anthropic"]'::jsonb,'{"qualityFirst":true,"maxAttempts":2}'::jsonb,'Oye !magine',false,true),
  ('route_ai_strategy','ai.generate','strategy','openai','["anthropic"]'::jsonb,'{"requiresResearch":true,"requiresGrounding":true}'::jsonb,'Oye !magine',false,true),
  ('route_ai_research','ai.generate','research_synthesis','openai','["anthropic"]'::jsonb,'{"requiresCitations":true,"freshnessAware":true}'::jsonb,'Oye !magine',false,true),
  ('route_ai_image','creative.generate','image','openai','[]'::jsonb,'{"brandLocked":true,"approvalAction":"creative.publish"}'::jsonb,'Oye !magine',false,true),
  ('route_ai_stt','voice.transcribe','conversation','openai','[]'::jsonb,'{"languages":["en","hi","hinglish"],"microphoneConsentRequired":true}'::jsonb,'Oye !magine',false,true),
  ('route_ai_tts','voice.speak','conversation','openai','[]'::jsonb,'{"languages":["en","hi","hinglish"]}'::jsonb,'Oye !magine',false,true),
  ('route_email_transactional','email.send','transactional','resend','[]'::jsonb,'{"consentPolicy":"transactional"}'::jsonb,'Oye !magine',false,true),
  ('route_email_lifecycle','email.send','lifecycle','resend','[]'::jsonb,'{"consentRequired":true,"approvalAction":"lifecycle.send"}'::jsonb,'Oye !magine',false,true),
  ('route_sms_lifecycle','sms.send','lifecycle','fast2sms','[]'::jsonb,'{"consentRequired":true,"dltRequired":true,"approvalAction":"lifecycle.send"}'::jsonb,'Oye !magine',false,true),
  ('route_whatsapp_lifecycle','whatsapp.send','lifecycle','aisensy','[]'::jsonb,'{"consentRequired":true,"templatePolicyRequired":true,"approvalAction":"lifecycle.send"}'::jsonb,'Oye !magine',false,true),
  ('route_google_oauth','oauth.connect','google','google_oauth','[]'::jsonb,'{"serverSideOnly":true}'::jsonb,'Oye !magine',false,true),
  ('route_google_ads','ads.execute','google_ads','google_oauth','[]'::jsonb,'{"approvalAction":"campaign.launch","spendEnvelopeRequired":true}'::jsonb,'Oye !magine',false,true),
  ('route_ga4','analytics.read','ga4','google_oauth','[]'::jsonb,'{"readOnly":true}'::jsonb,'Oye !magine',false,true),
  ('route_gsc','search.read','search_console','google_oauth','[]'::jsonb,'{"readOnly":true}'::jsonb,'Oye !magine',false,true),
  ('route_youtube','video.publish','youtube','google_oauth','[]'::jsonb,'{"approvalAction":"creative.publish"}'::jsonb,'Oye !magine',false,true)
on conflict (capability_key,purpose) do update set
  primary_provider_key=excluded.primary_provider_key,
  fallback_provider_keys=excluded.fallback_provider_keys,
  routing_policy=excluded.routing_policy,
  client_label='Oye !magine',
  client_provider_disclosure=false,
  enabled=true,
  updated_at=now();

commit;
