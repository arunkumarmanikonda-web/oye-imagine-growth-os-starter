$ErrorActionPreference = "Stop"

Write-Host "=== RUN MEGA BATCH A1 RECOVERY VALIDATION ===" -ForegroundColor Cyan
npm run test:foundation-recovery-profile-suite
if ($LASTEXITCODE -ne 0) {
  throw "Mega Batch A1 recovery validation failed with exit code $LASTEXITCODE"
}
Write-Host "=== MEGA BATCH A1 RECOVERY VALIDATION COMPLETE ===" -ForegroundColor Green