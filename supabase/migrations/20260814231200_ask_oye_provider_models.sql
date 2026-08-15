begin;

insert into public.config_provider_secret_fields(provider_key,field_key,label,field_type,required,sensitive,help_text,sort_order)
values
  ('openai','OPENAI_TEXT_MODEL','Default text model','text',true,false,'Model identifier approved for Oye conversational and synthesis tasks.',20),
  ('anthropic','ANTHROPIC_TEXT_MODEL','Default text model','text',true,false,'Model identifier approved for Oye fallback conversational and synthesis tasks.',20)
on conflict(provider_key,field_key) do update set
  label=excluded.label,field_type=excluded.field_type,required=excluded.required,sensitive=excluded.sensitive,help_text=excluded.help_text,sort_order=excluded.sort_order;

commit;