Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$testFiles = @(
  '.\tests\lib\config-control-provider-catalog.test.ts',
  '.\tests\lib\config-control-crypto.test.ts',
  '.\tests\lib\config-control-sync-planner.test.ts',
  '.\tests\lib\config-control-runtime-resolver.test.ts'
)

Write-Host '=== RECOVERY CONFIG TEST FILES ===' -ForegroundColor Cyan
$testFiles | ForEach-Object { Write-Host $_ }

Write-Host ''
Write-Host '=== RUN RECOVERY CONFIG SUITE ===' -ForegroundColor Cyan
npx vitest run $testFiles
if ($LASTEXITCODE -ne 0) {
  throw 'recovery config suite failed'
}

Write-Host ''
Write-Host '=== RUN FULL VALIDATION ===' -ForegroundColor Cyan
& .\scripts\Invoke-GrowthOsValidation.ps1
if ($LASTEXITCODE -ne 0) {
  throw 'full validation failed'
}

$sha = (git rev-parse --short HEAD).Trim()
Write-Host ''
Write-Host '=== RECOVERY CONFIG VALIDATION COMPLETE ===' -ForegroundColor Green
Write-Host $sha