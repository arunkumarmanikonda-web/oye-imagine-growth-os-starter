# Known Limitations

## Current limitations
- external channel publish actions are not production-proven for live third-party accounts; provider credential/profile/account/resource/readiness records are currently absent
- Google OAuth capabilities for Ads, GA4, Search Console and YouTube are registered but not connected to proven Neejee production resources
- WhatsApp/AiSensy capability is registered but not connected to a proven production account
- closed-loop AI routing now optimizes live-provider selection from task-specific cost and reliability evidence, but it intentionally remains deterministic until sufficient real usage history exists and does not yet incorporate explicit human quality ratings
- reporting KPIs are aggregation-ready but live GA4 / ads ingestion cannot be treated as active until provider-side access is connected and evidenced
- health-center logic does not substitute for independent infrastructure/provider telemetry
- usage guardrails enforce logical controls but billing reconciliation must remain unproven until real payment-gateway events are connected
- launch-readiness structures exist in the database and repository, but authenticated operator workflow proof remains dependent on the production administrator completing the mandatory password change and MFA enrollment
- Supabase Auth leaked-password protection remains disabled and must be enabled through the supported Auth configuration surface
- GitHub native Dependabot security alerts are disabled; weekly dependency update automation and a production `npm audit` gate reduce exposure but do not replace the native alert setting tracked by issue #175
- an enforced Content Security Policy is not yet present; report-only CSP telemetry is configured to inventory required Supabase, provider and media origins before enforcement

## Safe operating posture
- keep spend, publish, billing and other consequential external actions approval-gated until provider-side production proof exists
- treat exported/generated campaign artifacts as maker-checker artifacts until live adapters are authorized and verified
- keep AI usage caps active for pilot tenants
- do not bypass the production administrator password-change or MFA requirements to manufacture acceptance evidence
- preserve default-deny RLS for service-only tables instead of adding permissive client policies merely to remove informational linter notices
- keep dependency-security automation green and review generated dependency update PRs before merge
- run the full validation, production-activation, migration-parity, release-governance and workspace-branding gates before merge or production deployment

## Closed during 2026-08-18 hardening
- production signed-out login redirect loop
- canonical-host mismatch between page metadata and sitemap/robots
- browser-role `TRUNCATE`, `REFERENCES` and `TRIGGER` privileges on public tables
- browser execution of internal public-schema trigger/helper functions
- production/Git migration evidence drift after the privilege-hardening migrations
- public contact count-then-insert rate-limit race and email-rotation bypass
- shared secret environment module lacking an explicit server-only boundary
- CSP report-only observation and bounded, sanitized violation collection introduced as the evidence stage before enforcement
- fixed OpenAI-first automatic routing replaced with task-specific closed-loop cost/reliability routing while preserving explicit provider choice and production fallback controls
