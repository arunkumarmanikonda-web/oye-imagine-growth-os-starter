# Production Activation Checklist

Status is evidence-based. A green build, configured adapter, environment variable, generated artifact or database row created solely for testing does not make an external provider production-ready.

The authoritative runtime view is `/admin/release-readiness`, backed by `/api/admin/release-status`. It deliberately separates machine-verifiable platform controls from external/provider/human evidence.

## Deployment readiness
- [x] Vercel production deployment reaches `READY` on the exact tested Git SHA
- [x] Production aliases include `https://oyeimagine.com` and `https://www.oyeimagine.com`
- [x] Workspace branding smoke passes
- [x] Full Growth OS validation passes
- [x] Clean migration-chain replay passes in disposable PostgreSQL
- [x] Production/Git migration parity is reconciled through 93 source migrations and 93 production ledger entries
- [x] Service-role-only `release_schema_evidence()` exposes live migration count/tail to the release-readiness control plane
- [x] Canonical public host is aligned to `https://www.oyeimagine.com` in page metadata, sitemap and robots
- [x] Signed-out `/login` is reachable without an auth redirect loop
- [x] Post-release Vercel runtime error/fatal scan is clean
- [ ] Production secrets independently verified across every enabled external provider
- [ ] External callback URLs verified provider-side
- [ ] External webhook endpoints verified provider-side

## Authentication and platform security
- [x] Protected application routes remain behind session/membership enforcement
- [x] Public auth entry routes are reachable without session middleware loops
- [x] Admin API proxy/session boundary requires admin-lane membership and AAL2
- [x] Server-rendered admin workspace identity requires AAL2 regardless of membership metadata
- [x] Password sign-in redirects every admin lane session to MFA unless current assurance is AAL2
- [x] Server-side password policy requires at least 12 characters with uppercase, lowercase, number and symbol across signup/change/recovery flows
- [x] Public database tables use RLS; service-only tables remain default-deny where no client policy is intended
- [x] Browser-facing roles have no `TRUNCATE`, `REFERENCES` or `TRIGGER` privilege on public tables
- [x] Browser-facing roles cannot execute public-schema helper functions by default
- [x] Public contact intake uses a race-safe service-role rate limiter with separate network/device and identity ceilings
- [x] Shared secret environment access is guarded by a `server-only` import boundary
- [x] Repository-controlled dependency updates and a production dependency audit gate are configured
- [x] CSP report-only observation uses durable, privacy-minimized telemetry with RLS, service-only writes, hourly deduplication, abuse limits and 30-day retention
- [x] CSP telemetry stores normalized origin/path only; raw IP addresses, URL query strings and fragments are not persisted
- [ ] GitHub native Dependabot security alerts enabled and issue #175 closed with native GitHub evidence
- [ ] Production administrator completes mandatory password change and supplies real acceptance evidence
- [ ] Production administrator enrolls MFA and produces real AAL2 sign-in evidence
- [ ] Supabase Auth leaked-password protection enabled and security advisor re-run clean for that warning
- [ ] Enforced Content Security Policy introduced only after representative real report-only telemetry confirms tested Supabase/provider/media origin coverage

## Provider activation and machine readiness
- [x] Provider Activation Center is implemented
- [x] Google OAuth discovery and Provider Vault-backed runtime configuration are implemented
- [x] Managed Meta and LinkedIn OAuth use signed state, server-side token handling and exact resource selection
- [x] Google Ads machine QA verifies customer identity/status/billing and validate-only write authority without creating a campaign
- [x] Meta/Facebook, Instagram, LinkedIn and YouTube machine authority verification is implemented
- [x] Social/YouTube READY state requires a real supervised provider-write plus provider-readback canary
- [x] Provider readiness is tenant/workspace/account/resource bound and expires automatically
- [x] Legacy passing readiness values, including `go`, cannot authorize provider execution without a current machine certificate
- [ ] Google Ads developer token / production access confirmed provider-side
- [ ] GA4 property access confirmed provider-side
- [ ] Search Console property access confirmed provider-side
- [ ] YouTube OAuth/upload permissions confirmed provider-side
- [ ] Meta app review and business verification confirmed where enabled
- [ ] LinkedIn approved access confirmed where enabled
- [ ] Google Business Profile access confirmed where enabled
- [ ] Payment gateway merchant/webhook setup confirmed where enabled
- [ ] eSign provider production setup confirmed where enabled
- [ ] WhatsApp business verification/templates and live provider connection confirmed if enabled

## Governed funding and autonomy
- [x] Level-4 autonomy software and unattended scheduler are implemented
- [x] Consequential spend uses atomic reserve/settle/release against governed media balances
- [x] Media funding requires submitted remittance evidence and independent maker-checker verification before wallet credit
- [x] Funding credit is idempotent and browser roles cannot execute the credit function
- [x] Multi-channel execution adapters are implemented for Google Ads, Facebook, Instagram, LinkedIn, YouTube and governed lifecycle/report flows
- [x] Neejee `growth-executor` kill switch defaults ON and remains the deliberate final safety lock
- [ ] Real media funding remitted and independently verified into the Neejee wallet
- [ ] All intended provider channels hold current machine READY certificates
- [ ] Authorized operator deliberately releases the kill switch only after provider, funding and approval evidence is complete

## Neejee activation
- [x] Neejee tenant/workspace exists in production
- [x] Public Oye Imagine customer/case-study surface for Neejee is live
- [x] Neejee is mapped to the operational provider-evidence UUIDs and stable core commercial/autonomy keys
- [ ] Neejee website/provider connections proven by real provider/account evidence
- [ ] Neejee analytics connected and provider-side access proven
- [ ] Neejee ads connected and provider-side access proven
- [ ] Neejee Search Console connected and provider-side access proven
- [ ] Neejee approvals configured and verified with an authenticated production operator
- [ ] Neejee billing configured and reconciled against the intended payment path
- [ ] Neejee strategy approved by the authorized business owner

## Current evidence interpretation
The controlled Oye Imagine platform may be released while safety locks remain in place. This is distinct from authorizing live unattended external execution.

- Controlled platform release: machine controls must be green and may operate with the autonomy kill switch ON.
- Live provider activation: requires real connected provider/account/resource evidence and current machine readiness.
- Full unattended autonomy: additionally requires verified funding, approvals and deliberate kill-switch release.
- Unrestricted auto-spend/auto-publish: not enabled by default and must never be inferred from software implementation alone.
- CSP enforcement: remains pending representative real browser telemetry even though durable telemetry infrastructure is production-ready.

## Release rule
Do not convert an unchecked external or human item to complete from a mock, unit test, generated artifact, environment-variable assumption, adapter registration or database seed. Closure requires independently checkable production evidence from the relevant provider, repository/project setting, authenticated operator or real financial workflow.
