Write-Host "=== RUN MEGA BATCH A2 VALIDATION ===" -ForegroundColor Cyan

npm run test:foundation-workspace-suite
if ($LASTEXITCODE -ne 0) {
  throw "npm run test:foundation-workspace-suite failed with exit code $LASTEXITCODE"
}

Write-Host "=== MEGA BATCH A2 VALIDATION COMPLETE ===" -ForegroundColor Green