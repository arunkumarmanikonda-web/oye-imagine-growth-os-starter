$ErrorActionPreference = "Stop"

Write-Host "=== RUN MEGA BATCH B4 RECOVERY VALIDATION ===" -ForegroundColor Cyan
npm run test:foundation-commercial-recovery-suite
if ($LASTEXITCODE -ne 0) {
  throw "Mega Batch B4 recovery validation failed with exit code $LASTEXITCODE"
}
Write-Host "=== MEGA BATCH B4 RECOVERY VALIDATION COMPLETE ===" -ForegroundColor Green