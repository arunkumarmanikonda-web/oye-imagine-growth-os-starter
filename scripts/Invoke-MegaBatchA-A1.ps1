Write-Host "=== RUN MEGA BATCH A1 VALIDATION ===" -ForegroundColor Cyan

npm run test:foundation-profile-suite
if ($LASTEXITCODE -ne 0) {
  throw "npm run test:foundation-profile-suite failed with exit code $LASTEXITCODE"
}

Write-Host "=== MEGA BATCH A1 VALIDATION COMPLETE ===" -ForegroundColor Green