$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

function Invoke-LocalVitest {
  param([string[]]$CmdArgs)
  $vitestCmd = Join-Path (Get-Location) 'node_modules\.bin\vitest.cmd'
  $vitestMjs = Join-Path (Get-Location) 'node_modules\vitest\vitest.mjs'
  $pnpm = Get-Command pnpm -ErrorAction SilentlyContinue
  if (Test-Path $vitestCmd) { & $vitestCmd @CmdArgs; return }
  if (Test-Path $vitestMjs) { & node $vitestMjs @CmdArgs; return }
  if ($pnpm) { & pnpm exec vitest @CmdArgs; return }
  throw 'Local Vitest runner not found.'
}

Invoke-LocalVitest @(
  'run',
  'tests/lib/foundation-commercial-agreement-types.test.ts',
  'tests/lib/foundation-commercial-agreement-signup.test.ts',
  'tests/lib/foundation-commercial-agreement-legal-binding.test.ts'
)

$validation = @(
  Join-Path (Get-Location) 'scripts\Invoke-GrowthOsValidation.ps1',
  Join-Path (Get-Location) 'Invoke-GrowthOsValidation.ps1'
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $validation) { throw 'Invoke-GrowthOsValidation.ps1 not found.' }
& $validation

git rev-parse --short HEAD