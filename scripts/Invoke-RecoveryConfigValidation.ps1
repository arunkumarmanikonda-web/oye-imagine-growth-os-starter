Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '=== RUN RECOVERY CONFIG SUITE ===' -ForegroundColor Cyan

Write-Host ''
Write-Host '=== RUN FULL VALIDATION ===' -ForegroundColor Cyan
& .\scripts\Invoke-GrowthOsValidation.ps1
if ($LASTEXITCODE -ne 0) {
  throw 'full validation failed'
}

$sha = (git rev-parse --short HEAD).Trim()
Write-Host ''
Write-Host "=== RUN RECOVERY CONFIG VALIDATION ===" -ForegroundColor Cyan
npm run test:recovery-config-validation-suite
if ($LASTEXITCODE -ne 0) { throw "npm run test:recovery-config-validation-suite failed with exit code $LASTEXITCODE" }

Write-Host '=== RECOVERY CONFIG VALIDATION COMPLETE ===' -ForegroundColor Green
Write-Host $sha