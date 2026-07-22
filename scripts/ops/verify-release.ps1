param(
    [Parameter(Mandatory = $true)]
    [string]$BaseUrl
)

$BaseUrl = $BaseUrl.TrimEnd('/')

$Targets = @(
    [pscustomobject]@{ Path = "/"; Kind = "public" }
    [pscustomobject]@{ Path = "/login"; Kind = "public" }
    [pscustomobject]@{ Path = "/admin"; Kind = "admin" }
    [pscustomobject]@{ Path = "/admin/settings"; Kind = "admin" }
    [pscustomobject]@{ Path = "/admin/ops"; Kind = "admin" }
    [pscustomobject]@{ Path = "/api/admin/exports?kind=settings"; Kind = "export" }
    [pscustomobject]@{ Path = "/api/admin/exports?kind=versions"; Kind = "export" }
    [pscustomobject]@{ Path = "/api/admin/exports?kind=audit"; Kind = "export" }
)

$Results = foreach ($Target in $Targets) {
    $Url = "{0}{1}" -f $BaseUrl, $Target.Path
    $StatusCode = $null
    $ContentType = $null
    $Note = $null

    try {
        $Response = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -MaximumRedirection 0 -ErrorAction Stop
        $StatusCode = [int]$Response.StatusCode
        $ContentType = [string]$Response.Headers["Content-Type"]
    }
    catch {
        $WebResponse = $_.Exception.Response
        if ($WebResponse) {
            try { $StatusCode = [int]$WebResponse.StatusCode } catch { $StatusCode = -1 }
            try { $ContentType = [string]$WebResponse.Headers["Content-Type"] } catch { $ContentType = "" }
        }
        else {
            $StatusCode = -1
            $ContentType = ""
            $Note = "fail (request error)"
        }
    }

    if (-not $Note) {
        if ($StatusCode -ge 200 -and $StatusCode -lt 300) {
            $Note = "pass"
        }
        elseif ($StatusCode -in 301,302,303,307,308,401,403) {
            $Note = "pass (protected/redirect)"
        }
        elseif ($StatusCode -eq 404) {
            $Note = "fail (404)"
        }
        elseif ($StatusCode -ge 500) {
            $Note = "fail (server error)"
        }
        else {
            $Note = "fail"
        }
    }

    [pscustomobject]@{
        Url         = $Url
        StatusCode  = $StatusCode
        ContentType = $ContentType
        Result      = $Note
    }
}

$Results | Format-Table -AutoSize

if ($Results | Where-Object { $_.Result -like "fail*" }) {
    exit 1
}