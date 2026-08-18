# Autonomous execution activation

## Installed capability

The Growth OS now supports unattended execution for bounded Google Ads Search campaigns, lifecycle email/WhatsApp/SMS, Facebook Page publishing, Instagram image/Reels/Stories publishing, LinkedIn organisation posts, YouTube video uploads, and verified web report publication.

## Non-negotiable execution gates

Every consequential run must pass all of the following before provider mutation:

1. `growth-executor` is enabled at autonomy level 4.
2. Global kill switch is released.
3. Required tool classes are allowed for the action.
4. The action route is enabled for automatic execution.
5. An autonomous approval policy is active with no remaining human approver requirement.
6. The exact tenant/workspace provider account is connected and provider-verified.
7. The target channel has a passing publish-readiness record.
8. Spend actions have a matching prepaid media balance in the provider account currency.
9. Google Ads spend is reserved atomically and translated to a provider-side bounded total campaign budget.
10. Lifecycle messaging still passes consent and suppression checks.
11. Reports publish only from finalized KPI evidence.

## Activation state

The production `growth-executor` is installed with the kill switch active. Provider accounts, funded media balances and channel readiness evidence must be completed before release. Payment, provider configuration and legal actions remain human-controlled even after Level 4 execution is released.

## Scheduler

The autonomous queue worker is exposed at `/api/cron/autonomy` and authenticates against a secret stored in the private database schema. The `pg_cron` schedule is activated only after the production route is deployed. The scheduler claims queued actions with `FOR UPDATE SKIP LOCKED`, and stale claims are re-queued safely.

## Spend semantics

“Unattended auto-spend” means autonomous execution only inside a prepaid, tenant-scoped envelope. It does not mean unbounded spend. The database reserves funds before a provider mutation, settles them only after verified enablement, and releases them when a pre-enable failure is confirmed. Ambiguous provider outcomes remain reserved for reconciliation.
