Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host "=== ADMIN OPS RELEASE SURFACES ==="
npm run test:admin-ops-release-surfaces
if ($LASTEXITCODE -ne 0) { throw "npm run test:admin-ops-release-surfaces failed with exit code $LASTEXITCODE" }

Write-Host ''
Write-Host '=== RUN PRODUCTION ACTIVATION SUITE ===' -ForegroundColor Cyan
npm run test:activation-production-suite
if ($LASTEXITCODE -ne 0) {
  throw 'production activation suite failed'
}

Write-Host ''
Write-Host '=== RUN FULL VALIDATION ===' -ForegroundColor Cyan
npm run test:validation-full-suite
if ($LASTEXITCODE -ne 0) { throw "npm run test:validation-full-suite failed with exit code $LASTEXITCODE" }
& .\scripts\Invoke-GrowthOsValidation.ps1
if ($LASTEXITCODE -ne 0) {
  throw 'full validation failed'
}

$sha = (git rev-parse --short HEAD).Trim()
Write-Host ''
Write-Host '=== PRODUCTION ACTIVATION VALIDATION COMPLETE ===' -ForegroundColor Green
Write-Host $sha