$ErrorActionPreference = "Stop"

Write-Host "=== RUN MEGA BATCH B3 VALIDATION ===" -ForegroundColor Cyan
npm run test:foundation-finance-suite
if ($LASTEXITCODE -ne 0) {
  throw "Mega Batch B3 validation failed with exit code $LASTEXITCODE"
}
Write-Host "=== MEGA BATCH B3 VALIDATION COMPLETE ===" -ForegroundColor Green