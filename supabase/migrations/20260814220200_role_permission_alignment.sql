begin;

update public.core_role_definitions set permissions = '["tenant.*","brand.*","workspace.*","content.*","creative.*","campaign.*","approval.*","reporting.*","integration.*","finance.view","invoice.view","subscription.view","marketplace.view","privacy.view"]'::jsonb, updated_at=now() where role_key='tenant_admin';
update public.core_role_definitions set permissions = '["brand.view","workspace.view","content.*","creative.*","campaign.*","approval.*","reporting.view","marketplace.view"]'::jsonb, updated_at=now() where role_key='account_manager';
update public.core_role_definitions set permissions = '["brand.view","brand.update","workspace.view","content.*","creative.*","campaign.*","reporting.view"]'::jsonb, updated_at=now() where role_key='brand_manager';
update public.core_role_definitions set permissions = '["brand.view","workspace.view","content.view","content.update","creative.*","campaign.view"]'::jsonb, updated_at=now() where role_key='designer';
update public.core_role_definitions set permissions = '["brand.view","workspace.view","content.*","creative.*","campaign.*","analytics.view","reporting.view","reporting.generate","integration.view","approval.view"]'::jsonb, updated_at=now() where role_key='digital_marketer';
update public.core_role_definitions set permissions = '["brand.view","workspace.view","content.view","content.approve","creative.view","creative.update","creative.approve","approval.view","approval.act"]'::jsonb, updated_at=now() where role_key='content_approver';
update public.core_role_definitions set permissions = '["workspace.view","finance.view","finance.approve","invoice.view","subscription.view","approval.view","approval.act","privacy.view"]'::jsonb, updated_at=now() where role_key='finance_approver';
update public.core_role_definitions set permissions = '["workspace.view","analytics.view","reporting.view","reporting.generate","campaign.view","content.view","creative.view","integration.view"]'::jsonb, updated_at=now() where role_key='analyst';
update public.core_role_definitions set permissions = '["workspace.view","brand.view","content.view","creative.view","creative.update","marketplace.view","marketplace.update"]'::jsonb, updated_at=now() where role_key='partner_specialist';
update public.core_role_definitions set permissions = '["brand.view","workspace.view","campaign.view","content.view","creative.view","analytics.view","reporting.view","reporting.generate","finance.view","approval.view"]'::jsonb, updated_at=now() where role_key='client_operator';
update public.core_role_definitions set permissions = '["brand.view","workspace.view","reporting.view","creative.view"]'::jsonb, updated_at=now() where role_key='viewer';

commit;
