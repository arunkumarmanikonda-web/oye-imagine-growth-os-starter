Write-Host "=== RUN MEGA BATCH B1 VALIDATION ===" -ForegroundColor Cyan
npm run test:foundation-agreement-suite
if ($LASTEXITCODE -ne 0) { throw "npm run test:foundation-agreement-suite failed with exit code $LASTEXITCODE" }
Write-Host "=== MEGA BATCH B1 VALIDATION COMPLETE ===" -ForegroundColor Green