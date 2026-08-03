Write-Host "=== RUN MEGA BATCH B2 VALIDATION ===" -ForegroundColor Cyan
npm run test:foundation-invoice-suite
if ($LASTEXITCODE -ne 0) { throw "npm run test:foundation-invoice-suite failed with exit code $LASTEXITCODE" }
Write-Host "=== MEGA BATCH B2 VALIDATION COMPLETE ===" -ForegroundColor Green