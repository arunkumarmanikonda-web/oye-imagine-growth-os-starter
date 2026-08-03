Write-Host "=== RUN MEGA BATCH A3 VALIDATION ===" -ForegroundColor Cyan
npm run test:foundation-cms-suite
if ($LASTEXITCODE -ne 0) { throw "npm run test:foundation-cms-suite failed with exit code $LASTEXITCODE" }
Write-Host "=== MEGA BATCH A3 VALIDATION COMPLETE ===" -ForegroundColor Green