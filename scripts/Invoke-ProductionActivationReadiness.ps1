Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$testFiles = @(
  '.\tests\lib\activation-provider-requirements.test.ts',
  '.\tests\lib\activation-credential-status.test.ts',
  '.\tests\lib\activation-deployment-readiness.test.ts',
  '.\tests\lib\activation-production-gate.test.ts',
  '.\tests\lib\activation-neejee-checklist.test.ts'
)

Write-Host "=== ADMIN OPS RELEASE SURFACES ==="
npm run test:admin-ops-release-surfaces
if ($LASTEXITCODE -ne 0) { throw "npm run test:admin-ops-release-surfaces failed with exit code $LASTEXITCODE" }

Write-Host '=== PRODUCTION ACTIVATION TEST FILES ===' -ForegroundColor Cyan
$testFiles | ForEach-Object { Write-Host $_ }

Write-Host ''
Write-Host '=== RUN PRODUCTION ACTIVATION SUITE ===' -ForegroundColor Cyan
npm run test:activation-production-suite
if ($LASTEXITCODE -ne 0) {
  throw 'production activation suite failed'
}

Write-Host ''
Write-Host '=== RUN FULL VALIDATION ===' -ForegroundColor Cyan
& .\scripts\Invoke-GrowthOsValidation.ps1
if ($LASTEXITCODE -ne 0) {
  throw 'full validation failed'
}

$sha = (git rev-parse --short HEAD).Trim()
Write-Host ''
Write-Host '=== PRODUCTION ACTIVATION VALIDATION COMPLETE ===' -ForegroundColor Green
Write-Host $sha