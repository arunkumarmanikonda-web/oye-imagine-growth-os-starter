$ErrorActionPreference = 'Stop'

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $RepoRoot

function Invoke-LocalVitest {
  param(
    [Parameter(Mandatory = $true)][string[]]$CmdArgs
  )

  $VitestCmd = Join-Path $RepoRoot 'node_modules\.bin\vitest.cmd'
  $VitestMjs = Join-Path $RepoRoot 'node_modules\vitest\vitest.mjs'

  if (Test-Path $VitestCmd) {
    & $VitestCmd @CmdArgs
    return
  }

  if (Test-Path $VitestMjs) {
    & node $VitestMjs @CmdArgs
    return
  }

  throw 'Local Vitest runner not found.'
}

Invoke-LocalVitest @(
  'run'
  'tests/lib/foundation-marketplace-types.test.ts'
  'tests/lib/foundation-marketplace-engine.test.ts'
  'tests/lib/foundation-marketplace-registry.test.ts'
)

if ($LASTEXITCODE -ne 0) {
  throw 'Focused Mega Batch C2 tests failed.'
}

powershell -ExecutionPolicy Bypass -File .\scripts\Invoke-GrowthOsValidation.ps1
if ($LASTEXITCODE -ne 0) {
  throw 'Full validation failed after Mega Batch C2.'
}

git rev-parse --short HEAD