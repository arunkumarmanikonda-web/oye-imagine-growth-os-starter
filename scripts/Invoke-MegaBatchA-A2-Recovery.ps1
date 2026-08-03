$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host '=== RUN MEGA BATCH A2 RECOVERY VALIDATION ===' -ForegroundColor Cyan
npm run test:foundation-recovery-auth-suite
if ($LASTEXITCODE -ne 0) {
  throw 'Mega Batch A2 recovery validation failed.'
}
Write-Host '=== MEGA BATCH A2 RECOVERY VALIDATION COMPLETE ===' -ForegroundColor Green