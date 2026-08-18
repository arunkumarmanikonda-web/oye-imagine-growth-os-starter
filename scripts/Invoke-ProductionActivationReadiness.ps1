Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host "=== PRODUCTION SURFACE LOCKDOWN ==="
node scripts/verify-production-surface-lockdown.mjs
if ($LASTEXITCODE -ne 0) { throw "production surface lockdown verification failed with exit code $LASTEXITCODE" }

Write-Host ''
Write-Host "=== PUBLIC INTAKE ABUSE CONTROLS ==="
node scripts/verify-public-intake-abuse-controls.mjs
if ($LASTEXITCODE -ne 0) { throw "public intake abuse-control verification failed with exit code $LASTEXITCODE" }

Write-Host ''
Write-Host "=== WEBHOOK AUTHENTICITY AND REPLAY SAFETY ==="
node scripts/verify-webhook-authenticity-contract.mjs
if ($LASTEXITCODE -ne 0) { throw "webhook authenticity verification failed with exit code $LASTEXITCODE" }

Write-Host ''
Write-Host "=== UNSUBSCRIBE INTENT AND REPLAY SAFETY ==="
node scripts/verify-unsubscribe-intent-contract.mjs
if ($LASTEXITCODE -ne 0) { throw "unsubscribe intent/replay verification failed with exit code $LASTEXITCODE" }

Write-Host ''
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

$sha = (git rev-parse --short HEAD).Trim()
Write-Host ''
Write-Host '=== PRODUCTION ACTIVATION VALIDATION COMPLETE ===' -ForegroundColor Green
Write-Host $sha