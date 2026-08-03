$ErrorActionPreference = "Stop"

Write-Host "=== RUN MEGA BATCH B4 VALIDATION ===" -ForegroundColor Cyan
npm run test:foundation-commercial-suite
if ($LASTEXITCODE -ne 0) {
  throw "Mega Batch B4 validation failed with exit code $LASTEXITCODE"
}
Write-Host "=== MEGA BATCH B4 VALIDATION COMPLETE ===" -ForegroundColor Green