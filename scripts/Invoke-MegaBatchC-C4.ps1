$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

function Invoke-LocalVitest {
  param([Parameter(Mandatory = $true)][string[]]$CmdArgs)

  $vitestCmd = Join-Path (Get-Location) 'node_modules\.bin\vitest.cmd'
  $vitestMjs = Join-Path (Get-Location) 'node_modules\vitest\vitest.mjs'
  $pnpmCmd = Get-Command pnpm -ErrorAction SilentlyContinue

  if (Test-Path $vitestCmd) {
    & $vitestCmd @CmdArgs
    return
  }

  if (Test-Path $vitestMjs) {
    & node $vitestMjs @CmdArgs
    return
  }

  if ($pnpmCmd) {
    & pnpm exec vitest @CmdArgs
    return
  }

  throw 'Local Vitest runner not found.'
}

Invoke-LocalVitest @(
  'run'
  'tests/lib/foundation-concierge-experience-types.test.ts'
  'tests/lib/foundation-concierge-experience-engine.test.ts'
  'tests/lib/foundation-concierge-experience-marketplace.test.ts'
)

$validation = @(
  (Join-Path (Get-Location) 'scripts\Invoke-GrowthOsValidation.ps1'),
  (Join-Path (Get-Location) 'Invoke-GrowthOsValidation.ps1')
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $validation) {
  throw 'Invoke-GrowthOsValidation.ps1 not found.'
}

& $validation
git rev-parse --short HEAD