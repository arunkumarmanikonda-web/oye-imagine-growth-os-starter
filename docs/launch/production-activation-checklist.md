# Production Activation Checklist

Status is evidence-based. A green build or adapter definition does not make an external provider production-ready.

## Deployment readiness
- [x] Vercel production deployment passes and reaches `READY`
- [x] Workspace branding smoke passes
- [x] Full Growth OS validation passes
- [x] Migration-chain / production parity validation passes at 79 Git migrations and 79 production ledger entries
- [x] Canonical public host is aligned to `https://www.oyeimagine.com` in page metadata, sitemap and robots
- [x] Signed-out `/login` is reachable without an auth redirect loop
- [x] Post-release Vercel runtime-error scan is clean
- [ ] Production secrets independently verified across every external provider
- [ ] External callback URLs verified provider-side
- [ ] External webhook endpoints verified provider-side

## Authentication and platform security
- [x] Protected application routes remain behind session/membership enforcement
- [x] Public auth entry routes are reachable without session middleware loops
- [x] Public database tables use RLS; service-only tables remain default-deny where no client policy is intended
- [x] Browser-facing roles have no `TRUNCATE`, `REFERENCES` or `TRIGGER` privilege on public tables
- [x] Browser-facing roles cannot execute public-schema helper functions by default
- [x] Public contact intake uses a race-safe service-role rate limiter with separate network/device and identity ceilings
- [x] Shared secret environment access is guarded by a `server-only` import boundary
- [x] Repository-controlled weekly dependency updates and a production dependency audit gate are configured
- [x] CSP report-only observation is configured with a bounded, sanitized violation collector
- [ ] GitHub native Dependabot security alerts enabled and issue #175 closed with evidence
- [ ] Production administrator completes mandatory password change
- [ ] Production administrator enrolls MFA and produces real AAL2 sign-in evidence
- [ ] Supabase Auth leaked-password protection enabled and security advisor re-run
- [ ] Enforced Content Security Policy introduced only after report-only telemetry confirms tested Supabase/provider/media origin coverage

## External providers
- [ ] Google Ads developer token / production access confirmed provider-side
- [ ] GA4 property access confirmed provider-side
- [ ] Search Console property access confirmed provider-side
- [ ] YouTube OAuth/upload permissions confirmed provider-side
- [ ] Meta app review and business verification confirmed where enabled
- [ ] LinkedIn approved access confirmed where enabled
- [ ] Google Business Profile access confirmed where enabled
- [ ] Payment gateway merchant/webhook setup confirmed where enabled
- [ ] eSign provider production setup confirmed where enabled
- [ ] WhatsApp business verification/templates and live AiSensy connection confirmed if enabled

Current production control-plane state: provider adapters are registered, but `config_provider_credentials`, `provider_config_profiles`, `integration_accounts`, `provider_resource_links`, `external_provider_credentials` and `execution_channel_publish_readiness` contain no live provider connection/proof records. Consequential publishing and spend therefore remain approval-gated.

## Neejee activation
- [x] Neejee tenant exists in production
- [x] Public Oye Imagine customer/case-study surface for Neejee is live
- [ ] Neejee website connection proven in the provider/control-plane evidence model
- [ ] Neejee analytics connected and provider-side access proven
- [ ] Neejee ads connected and provider-side access proven
- [ ] Neejee Search Console connected and provider-side access proven
- [ ] Neejee approvals configured and verified with an authenticated production operator
- [ ] Neejee billing configured and reconciled against the intended payment path
- [ ] Neejee strategy approved by the authorized business owner

## Release rule
Do not convert an unchecked external/human item to complete from a mock, unit test, generated artifact, environment-variable assumption or adapter registration. Closure requires independently checkable production evidence.
