Set-Location (Split-Path -Parent $PSScriptRoot | Split-Path -Parent)
$ErrorActionPreference = "Stop"

function Invoke-LocalVitest {
  param([string[]]$CmdArgs)

  $vitestCmd = Join-Path (Get-Location) "node_modules\.bin\vitest.cmd"
  $vitestMjs = Join-Path (Get-Location) "node_modules\vitest\vitest.mjs"

  if (Test-Path $vitestCmd) {
    & $vitestCmd @CmdArgs
    return $LASTEXITCODE
  }

  if (Test-Path $vitestMjs) {
    & node $vitestMjs @CmdArgs
    return $LASTEXITCODE
  }

  throw "Local Vitest binary not found. Restore node_modules first."
}

Invoke-LocalVitest @(
  "run",
  "tests/lib/foundation-organization-profile.test.ts",
  "tests/lib/foundation-neejee-profile.test.ts",
  "tests/lib/foundation-cms-controller.test.ts",
  "tests/lib/foundation-public-shell.test.ts",
  "tests/lib/foundation-auth-session.test.ts",
  "tests/lib/foundation-route-access.test.ts",
  "tests/lib/foundation-canonical-workspace.test.ts"
)

if ($LASTEXITCODE -ne 0) {
  throw "Focused Mega Batch A / A2 tests failed."
}

if (-not (Test-Path ".\scripts\Invoke-GrowthOsValidation.ps1")) {
  throw "Missing scripts\Invoke-GrowthOsValidation.ps1"
}

powershell -ExecutionPolicy Bypass -File .\scripts\Invoke-GrowthOsValidation.ps1

if ($LASTEXITCODE -ne 0) {
  throw "Full validation failed."
}

git rev-parse --short HEAD