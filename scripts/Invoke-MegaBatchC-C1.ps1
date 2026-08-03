$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Push-Location $repoRoot

try {
    Write-Host "=== RUN MEGA BATCH C1 VALIDATION ===" -ForegroundColor Cyan
    npm run test:concierge-foundation-suite
    if ($LASTEXITCODE -ne 0) {
        throw "npm run test:concierge-foundation-suite failed with exit code $LASTEXITCODE"
    }

    Write-Host "=== MEGA BATCH C1 VALIDATION COMPLETE ===" -ForegroundColor Cyan
}
finally {
    Pop-Location
}