Write-Host "=== RUN MEGA BATCH C3 VALIDATION ===" -ForegroundColor Cyan

npm run test:concierge-retrieval-foundation-suite
if ($LASTEXITCODE -ne 0) {
  throw "npm run test:concierge-retrieval-foundation-suite failed with exit code $LASTEXITCODE"
}

Write-Host "=== MEGA BATCH C3 VALIDATION COMPLETE ===" -ForegroundColor Green