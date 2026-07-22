param(
    [string]$Root = ".\src\app\api\admin"
)

$ErrorActionPreference = "Stop"

$files = Get-ChildItem -Path $Root -Recurse -Filter route.ts | Sort-Object FullName

$result = foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    [PSCustomObject]@{
        route                 = $file.FullName.Replace((Get-Location).Path + "\", "")
        hasRequireAdminImport = ($content -match 'import\s+\{\s*requireAdmin\s*\}\s+from\s+"@/lib/admin-route"')
        hasAdminApiImport     = ($content -match 'import\s+\{[^\}]*adminJson[^\}]*\}\s+from\s+"@/lib/admin-api"')
        hasLocalRequireAdmin  = ($content -match '(?ms)^\s*(async\s+)?function\s+requireAdmin\(')
        hasLocalIsAuthorized  = ($content -match '(?ms)^\s*function\s+isAuthorized\(')
        hasLocalUnauthorized  = ($content -match '(?ms)^\s*function\s+unauthorized\(')
        hasLocalGetPassword   = ($content -match '(?ms)^\s*function\s+getAdminPassword\(')
        hasNextResponseJson   = ($content -match '\bNextResponse\.json\(')
        getHasGuard           = ($content -match '(?ms)export\s+async\s+function\s+GET\([^\)]*\)\s*\{[^\}]{0,400}requireAdmin\(request\)')
        putHasGuard           = ($content -match '(?ms)export\s+async\s+function\s+PUT\([^\)]*\)\s*\{[^\}]{0,400}requireAdmin\(request\)')
        postHasGuard          = ($content -match '(?ms)export\s+async\s+function\s+POST\([^\)]*\)\s*\{[^\}]{0,400}requireAdmin\(request\)')
        patchHasGuard         = ($content -match '(?ms)export\s+async\s+function\s+PATCH\([^\)]*\)\s*\{[^\}]{0,400}requireAdmin\(request\)')
        deleteHasGuard        = ($content -match '(?ms)export\s+async\s+function\s+DELETE\([^\)]*\)\s*\{[^\}]{0,400}requireAdmin\(request\)')
    }
}

$result | Format-Table -AutoSize

$artifactDir = Join-Path (Get-Location).Path 'artifacts'
if (-not (Test-Path $artifactDir)) {
    New-Item -ItemType Directory -Path $artifactDir -Force | Out-Null
}
$result | ConvertTo-Json -Depth 5 | Set-Content -Path (Join-Path $artifactDir 'admin-route-audit.json') -Encoding UTF8

Write-Host ""
Write-Host "Audit JSON saved to artifacts\admin-route-audit.json"