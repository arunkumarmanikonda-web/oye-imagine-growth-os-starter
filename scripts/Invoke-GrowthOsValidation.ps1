param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$patterns = @(
  'tests/lib/*feature*test.ts',
  'tests/lib/*approval*test.ts',
  'tests/lib/*routing*test.ts',
  'tests/lib/*tenant*test.ts',
  'tests/lib/pilot-*.test.ts',
  'tests/lib/execution-*.test.ts',
  'tests/lib/reporting-*.test.ts',
  'tests/lib/ops-*.test.ts',
  'tests/lib/release-gate.test.ts'
)

$testFiles = New-Object System.Collections.Generic.List[string]

foreach ($pattern in $patterns) {
  Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | ForEach-Object {
    $resolved = $_.FullName | Resolve-Path -Relative
    if (-not $testFiles.Contains($resolved)) {
      $testFiles.Add($resolved)
    }
  }
}

if ($testFiles.Count -eq 0) {
  throw 'no validation test files matched'
}

Write-Host "=== VALIDATION TEST FILES ===" -ForegroundColor Cyan
$testFiles | Sort-Object | ForEach-Object { Write-Host $_ }

Write-Host ""
Write-Host "=== RUN VALIDATION SUITE ===" -ForegroundColor Cyan
& npx vitest run @($testFiles | Sort-Object)
if ($LASTEXITCODE -ne 0) {
  throw 'validation suite failed'
}

Write-Host ""
Write-Host "=== VALIDATION COMPLETE ===" -ForegroundColor Cyan
git rev-parse --short HEAD