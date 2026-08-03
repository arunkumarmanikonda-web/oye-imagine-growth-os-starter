Write-Host "=== RUN MEGA BATCH A4 VALIDATION ===" -ForegroundColor Cyan
npm run test:foundation-support-suite
if ($LASTEXITCODE -ne 0) { throw "npm run test:foundation-support-suite failed with exit code $LASTEXITCODE" }
Write-Host "=== MEGA BATCH A4 VALIDATION COMPLETE ===" -ForegroundColor Green