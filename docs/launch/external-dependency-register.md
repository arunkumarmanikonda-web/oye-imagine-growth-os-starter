# External Dependency Register

This register records external and human dependencies that cannot be closed by application code alone. Status must reflect production evidence, not adapter availability or test coverage.

## Status meanings
- `verified`: production-side evidence exists and has been checked.
- `not_connected`: an adapter or capability may exist, but no live account/resource connection is proven.
- `no_evidence`: the expected production proof record does not yet exist.
- `blocked_user_action`: a real account holder must complete the action.
- `blocked_platform_setting`: the setting is outside the supported application/database automation surface.

## Current production truth — 2026-08-18

| Tenant | Provider | Dependency | Status | Operational owner | Evidence / next condition |
| --- | --- | --- | --- | --- | --- |
| oye-imagine | platform_admin | password_change | blocked_user_action | platform_owner | Production administrator remains flagged for a mandatory password change. Complete the real authenticated password-change flow; do not clear the flag administratively. |
| oye-imagine | platform_admin | mfa_enrollment | blocked_user_action | platform_owner | Platform-owner membership requires MFA and no factor is enrolled. Enroll a real factor and capture an AAL2 sign-in proof. |
| oye-imagine | supabase_auth | leaked_password_protection | blocked_platform_setting | platform_security | Supabase security advisor reports leaked-password protection disabled. Enable the Auth password-security setting and re-run the security advisor. |
| neejee | google_oauth | google_ads_live_access | not_connected | integrations | Google OAuth/Ads capability is registered, but no production credential profile, integration account, resource link or publish-readiness proof exists. |
| neejee | google_oauth | ga4_property_access | not_connected | integrations | No production control-plane credential/profile/account/resource evidence exists. |
| neejee | google_oauth | search_console_property_access | not_connected | integrations | No production control-plane credential/profile/account/resource evidence exists. |
| neejee | google_oauth | youtube_upload_access | not_connected | integrations | No production control-plane credential/profile/account/resource evidence exists. |
| neejee | aisensy | whatsapp_production_access | not_connected | integrations | AiSensy adapter is registered, but no production provider credential/profile/account/resource evidence exists. |
| neejee | external_channels | publish_readiness_proof | no_evidence | growth_ops | `execution_channel_publish_readiness` contains no provider-side production proof. Keep consequential publish/spend actions approval-gated until evidence exists. |

The same nine records are persisted in `public.external_dependency_register` in the production Supabase project so application/runtime surfaces can consume the operational truth.

## Closure discipline
A dependency can move to `verified` only when the external provider or real user action produces evidence that can be independently checked. Unit tests, mocks, generated drafts, adapter registration and CI success are not substitutes for provider-side proof.
