param(
    [string]$BaseUrl = "https://oye-imagine-growth-os-starter.vercel.app",
    [switch]$OpenBrowser,
    [switch]$WithDbChecks
)

$ErrorActionPreference = "Stop"

function Get-AdminHeaders {
    $adminPassword = if ($env:ADMIN_PASSWORD) { $env:ADMIN_PASSWORD } else { Read-Host "Enter ADMIN_PASSWORD" }
    return @{
        "x-admin-password" = $adminPassword
        "Content-Type"     = "application/json"
    }
}

function Invoke-AdminGet {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [Parameter(Mandatory = $true)][hashtable]$Headers
    )

    $response = Invoke-WebRequest -Uri $Url -Method GET -Headers $Headers -UseBasicParsing
    $json = $null
    try { $json = $response.Content | ConvertFrom-Json -Depth 100 } catch {}
    [PSCustomObject]@{
        Url        = $Url
        StatusCode = $response.StatusCode
        Json       = $json
        Raw        = $response.Content
    }
}

function Get-PsqlPath {
    $command = Get-Command psql.exe -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }

    $candidates = Get-ChildItem 'C:\Program Files\PostgreSQL' -Filter psql.exe -Recurse -ErrorAction SilentlyContinue |
        Sort-Object FullName

    if ($candidates) { return $candidates[0].FullName }

    throw "psql.exe not found."
}

$headers = Get-AdminHeaders

$targets = @(
    "$BaseUrl/api/admin/health",
    "$BaseUrl/api/admin/summary",
    "$BaseUrl/api/admin/strategy",
    "$BaseUrl/api/admin/execution"
)

$results = foreach ($target in $targets) {
    Invoke-AdminGet -Url $target -Headers $headers
}

$failed = $results | Where-Object { $_.StatusCode -ne 200 }

if ($OpenBrowser) {
    Start-Process "$BaseUrl/admin"
    Start-Process "$BaseUrl/admin/summary"
    Start-Process "$BaseUrl/admin/strategy"
    Start-Process "$BaseUrl/admin/execution"
}

$reportObject = [PSCustomObject]@{
    checkedAtUtc = (Get-Date).ToUniversalTime().ToString("o")
    baseUrl      = $BaseUrl
    endpoints    = $results | ForEach-Object {
        [PSCustomObject]@{
            url        = $_.Url
            statusCode = $_.StatusCode
            ok         = ($_.StatusCode -eq 200)
        }
    }
}

$reportDir = Join-Path (Get-Location) 'artifacts'
if (-not (Test-Path $reportDir)) {
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}
$reportPath = Join-Path $reportDir 'final-admin-qa.json'
$reportObject | ConvertTo-Json -Depth 20 | Set-Content -Path $reportPath -Encoding UTF8

Write-Host ''
Write-Host 'Final admin QA summary'
Write-Host '----------------------'
$results | ForEach-Object {
    Write-Host ("{0} -> {1}" -f $_.Url, $_.StatusCode)
}
Write-Host ("Report saved: {0}" -f $reportPath)

if ($WithDbChecks) {
    $psql = Get-PsqlPath
    $supabaseHost = 'db.bqhaifivpcwwiauiynlv.supabase.co'
    $dbUser = if ($env:PGUSER) { $env:PGUSER } else { 'postgres' }
    $dbName = if ($env:PGDATABASE) { $env:PGDATABASE } else { 'postgres' }
    if (-not $env:PGPASSWORD) { $env:PGPASSWORD = Read-Host 'Enter Supabase DB password' }
    $env:PGSSLMODE = 'require'

    $sql = @"
select 'workspace_settings' as table_name, count(*)::bigint as row_count
from public.workspace_settings
where workspace_id = '6ef7a4c5-a775-4d44-a655-fc31209061e7'
union all
select 'workspace_setting_versions' as table_name, count(*)::bigint as row_count
from public.workspace_setting_versions
where workspace_id = '6ef7a4c5-a775-4d44-a655-fc31209061e7'
union all
select 'admin_audit_events' as table_name, count(*)::bigint as row_count
from public.admin_audit_events
where workspace_id = '6ef7a4c5-a775-4d44-a655-fc31209061e7';
"@

    Write-Host ''
    Write-Host 'DB counts'
    Write-Host '---------'
    & $psql --host=$supabaseHost --port=5432 --username=$dbUser --dbname=$dbName -c $sql
}

if ($failed) {
    throw ("Final admin QA failed for {0} endpoint(s)." -f $failed.Count)
}

Write-Host ''
Write-Host 'Final admin QA PASSED'