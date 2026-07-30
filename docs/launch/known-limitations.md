# Known Limitations

## Current limitations
- external channel publish actions are draft/export oriented and not yet fully automated for all platforms
- AI provider routing is policy-based but not yet cost-optimized by real-time feedback loop
- reporting KPIs are aggregation-ready but not yet wired to live GA4 / ads ingestion adapters
- health center is rule-driven and not yet connected to live infrastructure telemetry
- usage guardrails enforce logical controls but not billing reconciliation with payment gateway events
- launch readiness checks are structured records and still need UI + workflow surfaces

## Safe operating posture
- keep spend-related actions approval-gated
- treat exported campaign drafts as maker-checker artifacts until live adapters are production verified
- keep AI usage caps active for pilot tenants
- use validation script before merge or deployment