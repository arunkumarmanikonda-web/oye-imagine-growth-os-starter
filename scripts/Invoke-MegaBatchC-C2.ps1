Write-Host "=== RUN MEGA BATCH C2 VALIDATION ===" -ForegroundColor Cyan

npm run test:marketplace-foundation-suite
if ($LASTEXITCODE -ne 0) {
  throw "npm run test:marketplace-foundation-suite failed with exit code $LASTEXITCODE"
}

Write-Host "=== MEGA BATCH C2 VALIDATION COMPLETE ===" -ForegroundColor Green