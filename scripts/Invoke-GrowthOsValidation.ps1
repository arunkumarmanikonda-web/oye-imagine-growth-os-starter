$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Push-Location $repoRoot

try {
    Write-Host "=== RUN FULL VALIDATION ===" -ForegroundColor Cyan
    npm run test:validation-full-suite
    if ($LASTEXITCODE -ne 0) {
        throw "npm run test:validation-full-suite failed with exit code $LASTEXITCODE"
    }

    Write-Host "=== VALIDATION COMPLETE ===" -ForegroundColor Cyan
}
finally {
    Pop-Location
}
