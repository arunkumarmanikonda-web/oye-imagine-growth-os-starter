# Operations Runbook

## Validation
Run local validation before merge or release:
```powershell
.\scripts\Invoke-GrowthOsValidation.ps1
```

## Deployment order
1. apply Supabase migrations
2. verify tenant / brand / workspace records
3. verify feature entitlements and approval policies
4. run validation suite
5. review launch readiness blockers
6. cut over pilot tenant
7. monitor health checks and usage snapshots

## Rollback triggers
- critical component health status = down
- validation regression on release branch
- hard usage cap triggered unexpectedly
- launch readiness blocker reopened after sign-off

## Immediate rollback actions
- pause release / deployment
- disable affected tenant features behind entitlement or approval policy
- revert application release
- investigate latest migration / integration change
- re-run validation after remediation