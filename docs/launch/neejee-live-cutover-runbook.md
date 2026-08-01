# Neejee Live Cutover Runbook

## Preconditions
- all production activation blockers resolved
- legal signoff complete
- finance signoff complete
- deployment readiness summary = ready

## Cutover order
1. verify website and tracking connectivity
2. verify Google Ads and Meta draft access
3. verify GA4 and Search Console reporting
4. verify billing and approval paths
5. verify production-safe autonomy level
6. perform final smoke checks
7. begin controlled live activation

## Immediate rollback triggers
- deployment failure
- invalid callback or webhook flow
- missing signoff
- ledger or payment mismatch
- live account permissions revoked
- publish or spend action outside policy