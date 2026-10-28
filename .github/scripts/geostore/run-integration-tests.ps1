# GeoStore REST integration tests (standard internal-DB / session-token path).
#
# OIDC / OAuth2 is intentionally NOT exercised here. The pre-merge OAuth2 stack
# was removed in PR #529 (Spring 7 upgrade) and the new layer based on Spring
# Security 7 oauth2-client is reintroduced in a separate workstream.
#
# Default target: this repository's standalone jetty:run on port 9191, context
# /geostore. That matches the CI workflow in .github/workflows/geostore-integration-tests.yml.
#
# Other useful invocations:
#   # MapStore overlay (cargo:run on :8080) — drives master GeoStore via MapStore
#   pwsh -File .github/scripts/geostore/run-integration-tests.ps1 `
#       -BaseUrl    http://localhost:8080/mapstore/rest/geostore `
#       -LandingUrl http://localhost:8080/mapstore/ `
#       -FrontEnd   http://localhost:8081 `
#       -Category   MAP
#
#   # webpack-dev-server split-proxy (after setting GEOSTORE_BACKEND_URL)
#   pwsh -File .github/scripts/geostore/run-integration-tests.ps1 `
#       -BaseUrl    http://localhost:8081/rest/geostore `
#       -LandingUrl http://localhost:8081/ `
#       -Category   MAP
#
# Exit code: 0 if all steps PASS, 1 if any step FAILs. CI uses this to gate.

param(
    # Standalone jetty:run defaults (matches the CI workflow).
    [string]$BaseUrl    = 'http://localhost:9191/geostore/rest',
    [string]$LandingUrl = 'http://localhost:9191/geostore/',
    [string]$FrontEnd   = 'http://localhost:9191/geostore',
    # Standalone jetty seeds only cat1/cat2 via sample_categories.xml.
    # When pointing at a MapStore overlay use MAP/DASHBOARD/etc.
    [string]$Category   = 'cat1',
    # Optional CSV dump of per-step results (useful as a CI artifact).
    [string]$ResultsCsv = '',
    [string]$AdminPassword = $env:GEOSTORE_TEST_ADMIN_PASSWORD,
    # The 'user' account is provisioned by this script; override only to reuse an existing one.
    [string]$UserPassword  = $env:GEOSTORE_TEST_USER_PASSWORD
)

$ErrorActionPreference = 'Continue'
$ProgressPreference    = 'SilentlyContinue'

if ([string]::IsNullOrWhiteSpace($AdminPassword)) {
    throw 'Set AdminPassword to the INITIAL_ADMIN_PASSWORD this test instance was started with.'
}
if ([string]::IsNullOrWhiteSpace($UserPassword)) {
    # A fixed sample 'user' is no longer seeded; create one with a generated password below.
    $UserPassword = 'Usr-' + [Guid]::NewGuid().ToString('N').Substring(0, 12) + '!'
}

$Base   = $BaseUrl
$FeBase = $FrontEnd
$AdminB = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:$AdminPassword"))
$UserB  = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("user:$UserPassword"))
$BadB   = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes('admin:wrongpass'))

$global:Results = New-Object System.Collections.ArrayList
$global:Pass = 0; $global:Fail = 0; $global:Step = 0
function Step([string]$Name, [scriptblock]$Block) {
    $global:Step++
    $stepNo = "{0:D2}" -f $global:Step
    try {
        $detail = & $Block
        $global:Pass++
        $line = "[PASS] $stepNo  $Name  -- $detail"
        Write-Host $line -ForegroundColor Green
        [void]$global:Results.Add([pscustomobject]@{Step=$stepNo; Name=$Name; Status='PASS'; Detail=$detail})
    } catch {
        $global:Fail++
        $msg = $_.Exception.Message
        if ($_.ErrorDetails) { $msg += " | body: " + ($_.ErrorDetails.Message -replace "`r?`n",' ' | Out-String).Substring(0, [Math]::Min(200, $_.ErrorDetails.Message.Length)) }
        $line = "[FAIL] $stepNo  $Name  -- $msg"
        Write-Host $line -ForegroundColor Red
        [void]$global:Results.Add([pscustomobject]@{Step=$stepNo; Name=$Name; Status='FAIL'; Detail=$msg})
    }
}

function Expect-Status([int]$Expected, [scriptblock]$Block) {
    try {
        $resp = & $Block
        if ($null -eq $resp) { return "got NULL response (expected $Expected)" }
        if ($resp.StatusCode -eq $Expected) { return "HTTP $Expected ok" }
        throw "expected HTTP $Expected got HTTP $($resp.StatusCode)"
    } catch [System.Net.WebException] {
        $st = [int]$_.Exception.Response.StatusCode
        if ($st -eq $Expected) { return "HTTP $Expected ok (via exception)" }
        throw "expected HTTP $Expected got HTTP $st"
    } catch [Microsoft.PowerShell.Commands.HttpResponseException] {
        $st = [int]$_.Exception.Response.StatusCode
        if ($st -eq $Expected) { return "HTTP $Expected ok (via exception)" }
        throw "expected HTTP $Expected got HTTP $st"
    }
}

Write-Host ""
Write-Host "===== GeoStore REST integration tests =====" -ForegroundColor Cyan
Write-Host "Base     = $Base"
Write-Host "Landing  = $LandingUrl"
Write-Host "Frontend = $FeBase"
Write-Host "Category = $Category"
Write-Host ""

# ========== Phase 1 — Auth sanity ==========

Step "backend landing page reachable (TCP/HTTP)" {
    # Accept any HTTP response (200 / 401 / 403 / 404) — we just want to know the server answers.
    try {
        $r = Invoke-WebRequest -Uri $LandingUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        "HTTP $($r.StatusCode), $($r.Content.Length) bytes"
    } catch [Microsoft.PowerShell.Commands.HttpResponseException] {
        "HTTP $([int]$_.Exception.Response.StatusCode) (server up)"
    } catch [System.Net.WebException] {
        if ($_.Exception.Response) { "HTTP $([int]$_.Exception.Response.StatusCode) (server up)" }
        else { throw "no response: $($_.Exception.Message)" }
    }
}

Step "fe root reachable" {
    $r = Invoke-WebRequest -Uri "$FeBase/" -UseBasicParsing -TimeoutSec 5
    if ($r.StatusCode -ne 200) { throw "got HTTP $($r.StatusCode)" }
    "HTTP 200, $($r.Content.Length) bytes"
}

Step "anonymous /users/user/details -> 401 or 403 (auth required)" {
    try {
        $null = Invoke-WebRequest -Uri "$Base/users/user/details" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        throw "expected auth-required failure, got HTTP 200"
    } catch [Microsoft.PowerShell.Commands.HttpResponseException] {
        $st = [int]$_.Exception.Response.StatusCode
        if ($st -ne 401 -and $st -ne 403) { throw "expected 401/403, got $st" }
        "HTTP $st ok (auth required)"
    } catch [System.Net.WebException] {
        $st = [int]$_.Exception.Response.StatusCode
        if ($st -ne 401 -and $st -ne 403) { throw "expected 401/403, got $st" }
        "HTTP $st ok (auth required)"
    }
}

Step "bad creds /users/user/details -> 401" {
    Expect-Status 401 { Invoke-WebRequest -Uri "$Base/users/user/details" -Headers @{Authorization=$BadB} -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop }
}

Step "fresh instance has no admin:admin login -> 401" {
    $old = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes('admin:admin'))
    Expect-Status 401 { Invoke-WebRequest -Uri "$Base/users/user/details" -Headers @{Authorization=$old} -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop }
}

Step "fresh instance has no user:user login -> 401" {
    $old = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes('user:user'))
    Expect-Status 401 { Invoke-WebRequest -Uri "$Base/users/user/details" -Headers @{Authorization=$old} -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop }
}

Step "admin Basic /users/user/details -> 200, role=ADMIN" {
    $r = Invoke-RestMethod -Uri "$Base/users/user/details" -Headers @{Authorization=$AdminB; Accept='application/json'} -TimeoutSec 5
    $u = $r.User
    if ($u.name -ne 'admin' -or $u.role -ne 'ADMIN') { throw "got name=$($u.name) role=$($u.role)" }
    "name=admin role=ADMIN id=$($u.id)"
}

Step "creating 'user' with its former default password is refused -> 400" {
    $body = "<User><name>user</name><newPassword>user</newPassword><role>USER</role><enabled>true</enabled></User>"
    Expect-Status 400 { Invoke-WebRequest -Uri "$Base/users/" -Method POST -Headers @{Authorization=$AdminB} -ContentType 'application/xml' -Body $body -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop }
}

Step "provision the 'user' USER account (admin) -> new id" {
    # The default seed no longer creates 'user'; the USER-role checks below need one.
    $body = "<User><name>user</name><newPassword>$UserPassword</newPassword><role>USER</role><enabled>true</enabled></User>"
    $id = Invoke-RestMethod -Uri "$Base/users/" -Method POST -Headers @{Authorization=$AdminB} -ContentType 'application/xml' -Body $body -TimeoutSec 5
    if (-not ($id -as [int])) { throw "expected numeric id, got '$id'" }
    "provisioned user id=$([int]$id)"
}

Step "user Basic /users/user/details -> 200, role=USER" {
    $r = Invoke-RestMethod -Uri "$Base/users/user/details" -Headers @{Authorization=$UserB; Accept='application/json'} -TimeoutSec 5
    $u = $r.User
    if ($u.name -ne 'user' -or $u.role -ne 'USER') { throw "got name=$($u.name) role=$($u.role)" }
    "name=user role=USER id=$($u.id)"
}

# ========== Phase 2 — Session token ==========

$script:SessionId  = $null
$script:RefreshTok = $null

Step "POST /session/login admin -> session token" {
    $r = Invoke-RestMethod -Uri "$Base/session/login" -Method POST -Headers @{Authorization=$AdminB; Accept='application/json'} -TimeoutSec 5
    # JSON shape may be wrapped under "SessionToken" or top-level
    $tok = $null; $refresh = $null; $expires = $null
    if ($r.SessionToken) { $tok = $r.SessionToken.access_token; $refresh = $r.SessionToken.refresh_token; $expires = $r.SessionToken.expires }
    else                 { $tok = $r.access_token;              $refresh = $r.refresh_token;              $expires = $r.expires }
    if (-not $tok) { throw "no access_token in response: $($r | ConvertTo-Json -Compress -Depth 5)" }
    $script:SessionId  = $tok
    $script:RefreshTok = $refresh
    "access_token len=$($tok.Length), expires=$expires"
}

Step "GET with bearer session token -> 200, name=admin" {
    if (-not $script:SessionId) { throw "no session token from prior step" }
    $r = Invoke-RestMethod -Uri "$Base/users/user/details" -Headers @{Authorization=("Bearer " + $script:SessionId); Accept='application/json'} -TimeoutSec 5
    if ($r.User.name -ne 'admin') { throw "got name=$($r.User.name)" }
    "bearer token authenticates admin"
}

# ========== Phase 3 — Read fixtures ==========

Step "GET /categories -> includes test Category" {
    $r = Invoke-RestMethod -Uri "$Base/categories" -Headers @{Authorization=$AdminB; Accept='application/json'} -TimeoutSec 5
    $names = @($r.CategoryList.Category | ForEach-Object { $_.name })
    if ($Category -notin $names) { throw "expected '$Category' in categories; got: $($names -join ',')" }
    "$($names.Count) categories, includes '$Category'"
}

Step "GET /users/count/* admin -> numeric >=2" {
    # No Accept header — endpoint returns text/plain (a number)
    $r = Invoke-WebRequest -Uri "$Base/users/count/*" -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5
    $cnt = [int]($r.Content.Trim())
    if ($cnt -lt 2) { throw "got count=$cnt" }
    "count=$cnt"
}

Step "GET /users/count/* user -> 403 (USER role forbidden)" {
    Expect-Status 403 { Invoke-WebRequest -Uri "$Base/users/count/*" -Headers @{Authorization=$UserB} -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop }
}

# ========== Phase 4 — Resource lifecycle ==========

$script:ResourceId = $null
$script:MapName    = "inttest-map-$(Get-Date -Format 'yyyyMMddHHmmss')"
$script:MapBlob    = '{"version":2,"map":{"center":{"x":12.0,"y":42.0,"crs":"EPSG:4326"},"zoom":4,"layers":[]}}'

Step "POST /resources/ create resource (XML) -> new id" {
    $body = @"
<Resource>
  <description>integration test map</description>
  <metadata>created by run-integration-tests.ps1</metadata>
  <name>$($script:MapName)</name>
  <category><name>$Category</name></category>
  <store><data><![CDATA[$($script:MapBlob)]]></data></store>
</Resource>
"@
    $id = Invoke-RestMethod -Uri "$Base/resources/" -Method POST -Headers @{Authorization=$AdminB} -ContentType 'application/xml' -Body $body -TimeoutSec 10
    if (-not ($id -as [int])) { throw "expected numeric id, got '$id'" }
    $script:ResourceId = [int]$id
    "resource id=$($script:ResourceId), name=$($script:MapName)"
}

Step "GET /resources/resource/{id}?includeAttributes=true -> 200, matches" {
    $r = Invoke-RestMethod -Uri "$Base/resources/resource/$($script:ResourceId)?includeAttributes=true" -Headers @{Authorization=$AdminB; Accept='application/json'} -TimeoutSec 5
    if ($r.Resource.name -ne $script:MapName) { throw "got name=$($r.Resource.name)" }
    if ($r.Resource.category.name -ne $Category) { throw "got category=$($r.Resource.category.name)" }
    "id=$($r.Resource.id) name=$($r.Resource.name) category=$($r.Resource.category.name)"
}

Step "GET /data/{id} -> stored payload matches" {
    $r = Invoke-WebRequest -Uri "$Base/data/$($script:ResourceId)" -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5
    $payload = $r.Content
    if ($payload -ne $script:MapBlob) { throw "payload mismatch (got $($payload.Length) bytes, want $($script:MapBlob.Length))" }
    "payload byte-identical ($($payload.Length) bytes)"
}

Step "PUT /resources/resource/{id} -> rename + new description" {
    $newName = "$($script:MapName)-renamed"
    $body = @"
<Resource>
  <description>renamed by integration test</description>
  <metadata>updated</metadata>
  <name>$newName</name>
  <category><name>$Category</name></category>
</Resource>
"@
    $null = Invoke-WebRequest -Uri "$Base/resources/resource/$($script:ResourceId)" -Method PUT -Headers @{Authorization=$AdminB} -ContentType 'application/xml' -Body $body -UseBasicParsing -TimeoutSec 5
    $script:MapName = $newName
    "renamed to $newName"
}

Step "GET resource after PUT -> updated name visible" {
    $r = Invoke-RestMethod -Uri "$Base/resources/resource/$($script:ResourceId)" -Headers @{Authorization=$AdminB; Accept='application/json'} -TimeoutSec 5
    if ($r.Resource.name -ne $script:MapName) { throw "got name=$($r.Resource.name) want $($script:MapName)" }
    "name=$($r.Resource.name) description=$($r.Resource.description)"
}

Step "GET /extjs/search/category/{Category}/* -> includes our resource" {
    # Response shape: {success, totalCount, results}; results is object when totalCount=1, array when >1
    $r = Invoke-RestMethod -Uri "$Base/extjs/search/category/$Category/*?start=0&limit=50" -Headers @{Authorization=$AdminB; Accept='application/json'} -TimeoutSec 5
    $items = @($r.results)
    $names = @($items | ForEach-Object { $_.name })
    if ($script:MapName -notin $names) { throw "$Category search totalCount=$($r.totalCount), names=[$($names -join ',')] does not include '$($script:MapName)'" }
    "found '$($script:MapName)' in totalCount=$($r.totalCount)"
}

# ========== Phase 5 — Tags ==========

$script:TagId   = $null
$script:TagName = "inttest-tag-$(Get-Date -Format 'HHmmss')"

Step "POST /resources/tag create tag -> new id" {
    # Tag service is mounted on the same jaxrs:server as RESTResourceService (address=/resources)
    $body = @"
<Tag><name>$($script:TagName)</name><description>integration test</description><color>#ff8800</color></Tag>
"@
    $id = Invoke-RestMethod -Uri "$Base/resources/tag" -Method POST -Headers @{Authorization=$AdminB} -ContentType 'application/xml' -Body $body -TimeoutSec 5
    if (-not ($id -as [int])) { throw "expected numeric id, got '$id'" }
    $script:TagId = [int]$id
    "tag id=$($script:TagId) name=$($script:TagName)"
}

Step "POST /resources/tag/{tagId}/resource/{resId} -> assign (200 or 204)" {
    # JAX-RS @POST returning void -> HTTP 204 No Content is success
    $r = Invoke-WebRequest -Uri "$Base/resources/tag/$($script:TagId)/resource/$($script:ResourceId)" -Method POST -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5
    if ($r.StatusCode -ne 200 -and $r.StatusCode -ne 204) { throw "got HTTP $($r.StatusCode)" }
    "tag $($script:TagId) -> resource $($script:ResourceId) attach HTTP $($r.StatusCode)"
}

Step "DELETE /resources/tag/{tagId}/resource/{resId} -> detach (round-trip)" {
    $r = Invoke-WebRequest -Uri "$Base/resources/tag/$($script:TagId)/resource/$($script:ResourceId)" -Method DELETE -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5
    if ($r.StatusCode -ne 200 -and $r.StatusCode -ne 204) { throw "got HTTP $($r.StatusCode)" }
    "tag $($script:TagId) detached from resource $($script:ResourceId) HTTP $($r.StatusCode)"
}

# ========== Phase 6 — UserGroup CRUD ==========

$script:GroupId   = $null
$script:GroupName = "inttest-group-$(Get-Date -Format 'HHmmss')"

Step "POST /usergroups create group -> new id" {
    $body = @"
<UserGroup><groupName>$($script:GroupName)</groupName><description>integration test group</description><enabled>true</enabled></UserGroup>
"@
    $id = Invoke-RestMethod -Uri "$Base/usergroups/" -Method POST -Headers @{Authorization=$AdminB} -ContentType 'application/xml' -Body $body -TimeoutSec 5
    if (-not ($id -as [int])) { throw "expected numeric id, got '$id'" }
    $script:GroupId = [int]$id
    "group id=$($script:GroupId) name=$($script:GroupName)"
}

Step "GET /usergroups/group/name/{name} -> 200, matches" {
    $r = Invoke-RestMethod -Uri "$Base/usergroups/group/name/$($script:GroupName)" -Headers @{Authorization=$AdminB; Accept='application/json'} -TimeoutSec 5
    if ($r.UserGroup.groupName -ne $script:GroupName) { throw "got groupName=$($r.UserGroup.groupName)" }
    "groupName=$($r.UserGroup.groupName) id=$($r.UserGroup.id)"
}

Step "DELETE /usergroups/group/{id} -> 200" {
    $null = Invoke-WebRequest -Uri "$Base/usergroups/group/$($script:GroupId)" -Method DELETE -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5
    "deleted group $($script:GroupId)"
}

# ========== Phase 7 — Cleanup ==========

Step "DELETE tag" {
    if ($script:TagId) {
        $null = Invoke-WebRequest -Uri "$Base/resources/tag/$($script:TagId)" -Method DELETE -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5
        "deleted tag $($script:TagId)"
    } else { "no tag to delete" }
}

Step "DELETE /resources/resource/{id} -> 200" {
    if ($script:ResourceId) {
        $null = Invoke-WebRequest -Uri "$Base/resources/resource/$($script:ResourceId)" -Method DELETE -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5
        "deleted resource $($script:ResourceId)"
    } else { "no resource to delete" }
}

Step "GET deleted resource -> 404" {
    if ($script:ResourceId) {
        Expect-Status 404 { Invoke-WebRequest -Uri "$Base/resources/resource/$($script:ResourceId)" -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop }
    } else { "no resource to check" }
}

# ========== Phase 8 — Session logout (regression-prone on spring7) ==========

$script:LogoutTok = $null

Step "POST /session/login (second token for logout test) -> token" {
    $r = Invoke-RestMethod -Uri "$Base/session/login" -Method POST -Headers @{Authorization=$AdminB; Accept='application/json'} -TimeoutSec 5
    $script:LogoutTok = if ($r.SessionToken) { $r.SessionToken.access_token } else { $r.access_token }
    if (-not $script:LogoutTok) { throw "no access_token in response" }
    "got token len=$($script:LogoutTok.Length)"
}

Step "bearer token validates BEFORE logout" {
    $r = Invoke-RestMethod -Uri "$Base/users/user/details" -Headers @{Authorization=("Bearer " + $script:LogoutTok); Accept='application/json'} -TimeoutSec 5
    if ($r.User.name -ne 'admin') { throw "got name=$($r.User.name)" }
    "pre-logout: bearer works"
}

Step "DELETE /session/{sessionId} (explicit token form) -> 200/204" {
    $r = Invoke-WebRequest -Uri "$Base/session/$($script:LogoutTok)" -Method DELETE -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5
    if (200, 204 -notcontains $r.StatusCode) { throw "got HTTP $($r.StatusCode)" }
    "logout HTTP $($r.StatusCode)"
}

Step "DELETE /session/logout (bearer-extracted form) -> 200/204" {
    # /session/logout extracts the bearer from header. spring7 had a code-review flag
    # that this would be a no-op; this test exercises the contract regardless.
    $r = Invoke-WebRequest -Uri "$Base/session/logout" -Method DELETE -Headers @{Authorization=("Bearer " + $script:LogoutTok)} -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    if (200, 204 -notcontains $r.StatusCode) { throw "got HTTP $($r.StatusCode)" }
    "logout-by-bearer HTTP $($r.StatusCode)"
}

# ========== Phase 9 — User CRUD + password change ==========

$script:NewUserId   = $null
$script:NewUserName = "inttest-user-$(Get-Date -Format 'HHmmss')"
$script:NewUserPwd  = "TestPwd-1!"

Step "POST /users create new USER role -> new id" {
    $body = @"
<User><name>$($script:NewUserName)</name><newPassword>$($script:NewUserPwd)</newPassword><role>USER</role><enabled>true</enabled></User>
"@
    $id = Invoke-RestMethod -Uri "$Base/users/" -Method POST -Headers @{Authorization=$AdminB} -ContentType 'application/xml' -Body $body -TimeoutSec 5
    if (-not ($id -as [int])) { throw "expected numeric id, got '$id'" }
    $script:NewUserId = [int]$id
    "user id=$($script:NewUserId) name=$($script:NewUserName)"
}

Step "auth as new user with initial password -> 200" {
    $b = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($script:NewUserName):$($script:NewUserPwd)"))
    $r = Invoke-RestMethod -Uri "$Base/users/user/details" -Headers @{Authorization=$b; Accept='application/json'} -TimeoutSec 5
    if ($r.User.name -ne $script:NewUserName) { throw "got name=$($r.User.name)" }
    if ($r.User.role -ne 'USER') { throw "got role=$($r.User.role)" }
    "auth ok, role=USER"
}

Step "PUT /users/user/{id} change password" {
    $newPwd = "Changed-2@"
    $body = @"
<User><id>$($script:NewUserId)</id><name>$($script:NewUserName)</name><newPassword>$newPwd</newPassword><role>USER</role><enabled>true</enabled></User>
"@
    $r = Invoke-WebRequest -Uri "$Base/users/user/$($script:NewUserId)" -Method PUT -Headers @{Authorization=$AdminB} -ContentType 'application/xml' -Body $body -UseBasicParsing -TimeoutSec 5
    if (200, 204 -notcontains $r.StatusCode) { throw "got HTTP $($r.StatusCode)" }
    $script:NewUserPwd = $newPwd
    "password change HTTP $($r.StatusCode)"
}

Step "auth with NEW password -> 200" {
    $b = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($script:NewUserName):$($script:NewUserPwd)"))
    $r = Invoke-RestMethod -Uri "$Base/users/user/details" -Headers @{Authorization=$b; Accept='application/json'} -TimeoutSec 5
    if ($r.User.name -ne $script:NewUserName) { throw "got name=$($r.User.name)" }
    "new password works"
}

Step "auth with OLD password -> 401" {
    $b = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($script:NewUserName):TestPwd-1!"))
    try {
        $null = Invoke-WebRequest -Uri "$Base/users/user/details" -Headers @{Authorization=$b} -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        throw "REGRESSION: old password still accepted after change"
    } catch [Microsoft.PowerShell.Commands.HttpResponseException] {
        $st = [int]$_.Exception.Response.StatusCode
        if ($st -ne 401) { throw "expected 401 got $st" }
        "old password rejected HTTP 401"
    } catch [System.Net.WebException] {
        $st = [int]$_.Exception.Response.StatusCode
        if ($st -ne 401) { throw "expected 401 got $st" }
        "old password rejected HTTP 401"
    }
}

# ========== Phase 10 — UserGroup membership ==========

$script:GroupMembId   = $null
$script:GroupMembName = "inttest-membergroup-$(Get-Date -Format 'HHmmss')"

Step "POST /usergroups create membership group -> new id" {
    $body = @"
<UserGroup><groupName>$($script:GroupMembName)</groupName><description>membership test</description><enabled>true</enabled></UserGroup>
"@
    $id = Invoke-RestMethod -Uri "$Base/usergroups/" -Method POST -Headers @{Authorization=$AdminB} -ContentType 'application/xml' -Body $body -TimeoutSec 5
    if (-not ($id -as [int])) { throw "expected numeric id, got '$id'" }
    $script:GroupMembId = [int]$id
    "group id=$($script:GroupMembId)"
}

Step "POST /usergroups/group/{userid}/{groupid} add user to group" {
    $r = Invoke-WebRequest -Uri "$Base/usergroups/group/$($script:NewUserId)/$($script:GroupMembId)" -Method POST -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5
    if (200, 204 -notcontains $r.StatusCode) { throw "got HTTP $($r.StatusCode)" }
    "added user $($script:NewUserId) to group $($script:GroupMembId) HTTP $($r.StatusCode)"
}

Step "GET user with groups -> includes new group" {
    $r = Invoke-RestMethod -Uri "$Base/users/user/$($script:NewUserId)" -Headers @{Authorization=$AdminB; Accept='application/json'} -TimeoutSec 5
    # Shape: groups.group is an object when 1 group, array when 2+; "" when none
    $groupsField = $r.User.groups
    $names = @()
    if ($groupsField -and $groupsField.group) {
        $g = $groupsField.group
        if ($g -is [System.Array]) { $names = @($g | ForEach-Object { $_.groupName }) }
        else                       { $names = @($g.groupName) }
    }
    if ($script:GroupMembName -notin $names) { throw "group '$($script:GroupMembName)' not in user groups; got: [$($names -join ',')]" }
    "user has $($names.Count) explicit group(s) incl '$($script:GroupMembName)'"
}

Step "DELETE /usergroups/group/{userid}/{groupid} remove from group" {
    $r = Invoke-WebRequest -Uri "$Base/usergroups/group/$($script:NewUserId)/$($script:GroupMembId)" -Method DELETE -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5
    if (200, 204 -notcontains $r.StatusCode) { throw "got HTTP $($r.StatusCode)" }
    "removed user from group HTTP $($r.StatusCode)"
}

# ========== Phase 11 — Resource attributes (path-style) ==========

$script:AttrResId = $null

Step "POST /resources/ second resource for attribute tests -> new id" {
    $name = "attrtest-$(Get-Date -Format 'HHmmss')"
    $body = @"
<Resource>
  <description>attribute test</description>
  <metadata></metadata>
  <name>$name</name>
  <category><name>$Category</name></category>
  <store><data>{}</data></store>
</Resource>
"@
    $id = Invoke-RestMethod -Uri "$Base/resources/" -Method POST -Headers @{Authorization=$AdminB} -ContentType 'application/xml' -Body $body -TimeoutSec 5
    $script:AttrResId = [int]$id
    "attr-test resource id=$($script:AttrResId)"
}

Step "PUT /resources/resource/{id}/attributes/{name}/{value} (path-style)" {
    # Use a simple value — CXF struggles to URL-decode complex content in path segments
    $r = Invoke-WebRequest -Uri "$Base/resources/resource/$($script:AttrResId)/attributes/thumbnail/simpleValue" -Method PUT -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5
    if (200, 204 -notcontains $r.StatusCode) { throw "got HTTP $($r.StatusCode)" }
    "attribute 'thumbnail' set HTTP $($r.StatusCode)"
}

Step "GET /resources/resource/{id}/attributes -> includes our attribute" {
    $r = Invoke-RestMethod -Uri "$Base/resources/resource/$($script:AttrResId)/attributes" -Headers @{Authorization=$AdminB; Accept='application/json'} -TimeoutSec 5
    # Shape: AttributeList.Attribute is an object when 1, array when 2+
    $attrField = $r.AttributeList.Attribute
    $names = @()
    if ($attrField -is [System.Array]) { $names = @($attrField | ForEach-Object { $_.name }) }
    elseif ($attrField.name)           { $names = @($attrField.name) }
    if ('thumbnail' -notin $names) { throw "'thumbnail' attribute missing; got: [$($names -join ',')]" }
    "$($names.Count) attribute(s), includes 'thumbnail'"
}

# ========== Phase 12 — SecurityRule enforcement ==========

$script:SecResId = $null

Step "POST /resources/ third resource for security test (admin owns)" {
    $name = "sectest-$(Get-Date -Format 'HHmmss')"
    $body = @"
<Resource>
  <description>security rule test</description><metadata></metadata>
  <name>$name</name>
  <category><name>$Category</name></category>
  <store><data>{}</data></store>
</Resource>
"@
    $id = Invoke-RestMethod -Uri "$Base/resources/" -Method POST -Headers @{Authorization=$AdminB} -ContentType 'application/xml' -Body $body -TimeoutSec 5
    $script:SecResId = [int]$id
    "sec-test resource id=$($script:SecResId)"
}

Step "GET resource as NEW USER (no rule) -> 403/404" {
    $b = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($script:NewUserName):$($script:NewUserPwd)"))
    try {
        $null = Invoke-WebRequest -Uri "$Base/resources/resource/$($script:SecResId)" -Headers @{Authorization=$b} -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        throw "REGRESSION: USER could read resource without permission rule"
    } catch [Microsoft.PowerShell.Commands.HttpResponseException] {
        $st = [int]$_.Exception.Response.StatusCode
        if ($st -ne 403 -and $st -ne 404) { throw "expected 403/404 got $st" }
        "blocked HTTP $st (no rule yet)"
    } catch [System.Net.WebException] {
        $st = [int]$_.Exception.Response.StatusCode
        if ($st -ne 403 -and $st -ne 404) { throw "expected 403/404 got $st" }
        "blocked HTTP $st (no rule yet)"
    }
}

Step "POST /resources/resource/{id}/permissions grant canRead to NEW USER" {
    # @POST with @Consumes(XML/JSON) and @Multipart("rules") — CXF accepts plain XML body
    $body = @"
<SecurityRuleList>
  <SecurityRule>
    <canRead>true</canRead><canWrite>false</canWrite>
    <user><id>$($script:NewUserId)</id><name>$($script:NewUserName)</name></user>
  </SecurityRule>
</SecurityRuleList>
"@
    $r = Invoke-WebRequest -Uri "$Base/resources/resource/$($script:SecResId)/permissions" -Method POST -Headers @{Authorization=$AdminB} -ContentType 'application/xml' -Body $body -UseBasicParsing -TimeoutSec 5
    if (200, 204 -notcontains $r.StatusCode) { throw "got HTTP $($r.StatusCode)" }
    "permission rule set HTTP $($r.StatusCode)"
}

Step "GET resource as NEW USER (with rule) -> 200" {
    $b = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($script:NewUserName):$($script:NewUserPwd)"))
    $r = Invoke-RestMethod -Uri "$Base/resources/resource/$($script:SecResId)" -Headers @{Authorization=$b; Accept='application/json'} -TimeoutSec 5
    if (-not $r.Resource.id) { throw "no resource id in response" }
    "USER can now read via SecurityRule, id=$($r.Resource.id)"
}

# ========== Phase 12b — user-delete cascade of session resources (support #5817) ==========
# DELETE /users/user/{id}?cascadeResourceDelete=<cat1,cat2,...> must delete the resources of the
# listed categories that the user solely owns (e.g. MapStore USERSESSION resources), preserve
# shared resources and resources of unlisted categories, and never fail on unknown categories.

$script:CascCatName   = 'USERSESSION'
$script:CascCatId     = $null
$script:CascUserId    = $null
$script:CascUserName  = "inttest-casc-$(Get-Date -Format 'HHmmss')"
$script:CascUserPwd   = 'CascPwd-1!'
$script:CascUserB     = $null
$script:CascSessResId = $null
$script:CascOtherResId = $null
$script:CascSharedResId = $null
$script:SeededUserId  = $null

Step "ensure USERSESSION category exists (reuse or create)" {
    $r = Invoke-RestMethod -Uri "$Base/categories" -Headers @{Authorization=$AdminB; Accept='application/json'} -TimeoutSec 5
    $cats = @($r.CategoryList.Category)
    $existing = $cats | Where-Object { $_.name -eq $script:CascCatName }
    if ($existing) {
        $script:CascCatId = [int]@($existing)[0].id
        "reused category id=$($script:CascCatId)"
    } else {
        $id = Invoke-RestMethod -Uri "$Base/categories/" -Method POST -Headers @{Authorization=$AdminB} -ContentType 'application/xml' -Body "<Category><name>$($script:CascCatName)</name></Category>" -TimeoutSec 5
        if (-not ($id -as [int])) { throw "expected numeric id, got '$id'" }
        $script:CascCatId = [int]$id
        "created category id=$($script:CascCatId)"
    }
}

Step "POST /users create cascade-test user -> new id" {
    $body = @"
<User><name>$($script:CascUserName)</name><newPassword>$($script:CascUserPwd)</newPassword><role>USER</role><enabled>true</enabled></User>
"@
    $id = Invoke-RestMethod -Uri "$Base/users/" -Method POST -Headers @{Authorization=$AdminB} -ContentType 'application/xml' -Body $body -TimeoutSec 5
    if (-not ($id -as [int])) { throw "expected numeric id, got '$id'" }
    $script:CascUserId = [int]$id
    $script:CascUserB = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($script:CascUserName):$($script:CascUserPwd)"))
    "user id=$($script:CascUserId) name=$($script:CascUserName)"
}

Step "cascade user creates USERSESSION resource (solely owned)" {
    # Created with the user's own credentials so the owner SecurityRule is the user's — same as
    # MapStore persisting a user session.
    $body = @"
<Resource>
  <description>user session of $($script:CascUserName)</description><metadata></metadata>
  <name>default.$($script:CascUserName)</name>
  <category><name>$($script:CascCatName)</name></category>
  <store><data><![CDATA[{"session":true}]]></data></store>
</Resource>
"@
    $id = Invoke-RestMethod -Uri "$Base/resources/" -Method POST -Headers @{Authorization=$script:CascUserB} -ContentType 'application/xml' -Body $body -TimeoutSec 5
    $script:CascSessResId = [int]$id
    "session resource id=$($script:CascSessResId)"
}

Step "cascade user creates resource in OTHER category ($Category)" {
    $body = @"
<Resource>
  <description>non-session resource of $($script:CascUserName)</description><metadata></metadata>
  <name>casc-other-$(Get-Date -Format 'HHmmss')</name>
  <category><name>$Category</name></category>
  <store><data>{}</data></store>
</Resource>
"@
    $id = Invoke-RestMethod -Uri "$Base/resources/" -Method POST -Headers @{Authorization=$script:CascUserB} -ContentType 'application/xml' -Body $body -TimeoutSec 5
    $script:CascOtherResId = [int]$id
    "other-category resource id=$($script:CascOtherResId)"
}

Step "cascade user creates SHARED USERSESSION resource (+read rule for seeded user)" {
    $r = Invoke-RestMethod -Uri "$Base/users/user/details" -Headers @{Authorization=$UserB; Accept='application/json'} -TimeoutSec 5
    $script:SeededUserId = [int]$r.User.id
    $body = @"
<Resource>
  <description>shared session</description><metadata></metadata>
  <name>shared.$($script:CascUserName)</name>
  <category><name>$($script:CascCatName)</name></category>
  <store><data>{}</data></store>
</Resource>
"@
    $id = Invoke-RestMethod -Uri "$Base/resources/" -Method POST -Headers @{Authorization=$script:CascUserB} -ContentType 'application/xml' -Body $body -TimeoutSec 5
    $script:CascSharedResId = [int]$id
    # Replace the rule list with owner rule + a read rule for the seeded 'user': now 2 rules, so
    # the resource is NOT solely owned and the cascade must preserve it.
    $rules = @"
<SecurityRuleList>
  <SecurityRule>
    <canRead>true</canRead><canWrite>true</canWrite>
    <user><id>$($script:CascUserId)</id><name>$($script:CascUserName)</name></user>
  </SecurityRule>
  <SecurityRule>
    <canRead>true</canRead><canWrite>false</canWrite>
    <user><id>$($script:SeededUserId)</id><name>user</name></user>
  </SecurityRule>
</SecurityRuleList>
"@
    $resp = Invoke-WebRequest -Uri "$Base/resources/resource/$($script:CascSharedResId)/permissions" -Method POST -Headers @{Authorization=$AdminB} -ContentType 'application/xml' -Body $rules -UseBasicParsing -TimeoutSec 5
    if (200, 204 -notcontains $resp.StatusCode) { throw "permissions got HTTP $($resp.StatusCode)" }
    "shared resource id=$($script:CascSharedResId), 2 rules"
}

Step "DELETE user ?cascadeResourceDelete=USERSESSION,NOT_A_CATEGORY -> 200/204" {
    # Comma-separated list; the unknown category must be ignored without failing the request.
    $r = Invoke-WebRequest -Uri "$Base/users/user/$($script:CascUserId)?cascadeResourceDelete=$($script:CascCatName),NOT_A_CATEGORY" -Method DELETE -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 10
    if (200, 204 -notcontains $r.StatusCode) { throw "got HTTP $($r.StatusCode)" }
    "user delete HTTP $($r.StatusCode)"
}

Step "deleted user -> 404" {
    Expect-Status 404 { Invoke-WebRequest -Uri "$Base/users/user/$($script:CascUserId)" -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop }
}

Step "solely-owned USERSESSION resource -> 404 (cascade-deleted)" {
    Expect-Status 404 { Invoke-WebRequest -Uri "$Base/resources/resource/$($script:CascSessResId)" -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop }
}

Step "other-category resource survives the cascade -> 200" {
    $r = Invoke-RestMethod -Uri "$Base/resources/resource/$($script:CascOtherResId)" -Headers @{Authorization=$AdminB; Accept='application/json'} -TimeoutSec 5
    if ([int]$r.Resource.id -ne $script:CascOtherResId) { throw "got id=$($r.Resource.id)" }
    "resource $($script:CascOtherResId) preserved"
}

Step "shared USERSESSION resource survives -> 200, seeded user still reads it" {
    $r = Invoke-RestMethod -Uri "$Base/resources/resource/$($script:CascSharedResId)" -Headers @{Authorization=$UserB; Accept='application/json'} -TimeoutSec 5
    if ([int]$r.Resource.id -ne $script:CascSharedResId) { throw "got id=$($r.Resource.id)" }
    "resource $($script:CascSharedResId) preserved and readable by seeded user"
}

Step "plain DELETE (no cascade param) keeps default behavior -> user gone, resource left" {
    # Backward compatibility: without the parameter the user's resources are left untouched.
    $name = "inttest-casc2-$(Get-Date -Format 'HHmmss')"
    $id = Invoke-RestMethod -Uri "$Base/users/" -Method POST -Headers @{Authorization=$AdminB} -ContentType 'application/xml' -Body "<User><name>$name</name><newPassword>$($script:CascUserPwd)</newPassword><role>USER</role><enabled>true</enabled></User>" -TimeoutSec 5
    $uid = [int]$id
    $b = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${name}:$($script:CascUserPwd)"))
    $body = @"
<Resource>
  <description>session kept by plain delete</description><metadata></metadata>
  <name>plain.$name</name>
  <category><name>$($script:CascCatName)</name></category>
  <store><data>{}</data></store>
</Resource>
"@
    $rid = [int](Invoke-RestMethod -Uri "$Base/resources/" -Method POST -Headers @{Authorization=$b} -ContentType 'application/xml' -Body $body -TimeoutSec 5)
    $r = Invoke-WebRequest -Uri "$Base/users/user/$uid" -Method DELETE -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 10
    if (200, 204 -notcontains $r.StatusCode) { throw "user delete got HTTP $($r.StatusCode)" }
    $check = Invoke-RestMethod -Uri "$Base/resources/resource/$rid" -Headers @{Authorization=$AdminB; Accept='application/json'} -TimeoutSec 5
    if ([int]$check.Resource.id -ne $rid) { throw "resource unexpectedly gone" }
    $script:CascPlainResId = $rid
    "user $uid deleted, resource $rid left untouched (no cascade requested)"
}

Step "DELETE user with cascade of category having NO resources -> 200/204" {
    # Robustness: the request succeeds even when the listed category exists but holds nothing
    # owned by the user.
    $name = "inttest-casc3-$(Get-Date -Format 'HHmmss')"
    $id = Invoke-RestMethod -Uri "$Base/users/" -Method POST -Headers @{Authorization=$AdminB} -ContentType 'application/xml' -Body "<User><name>$name</name><newPassword>$($script:CascUserPwd)</newPassword><role>USER</role><enabled>true</enabled></User>" -TimeoutSec 5
    $uid = [int]$id
    $r = Invoke-WebRequest -Uri "$Base/users/user/$uid`?cascadeResourceDelete=$($script:CascCatName)" -Method DELETE -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 10
    if (200, 204 -notcontains $r.StatusCode) { throw "got HTTP $($r.StatusCode)" }
    Expect-Status 404 { Invoke-WebRequest -Uri "$Base/users/user/$uid" -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop } | Out-Null
    "user $uid deleted with empty cascade"
}

Step "cascade phase cleanup (surviving resources)" {
    foreach ($rid in @($script:CascOtherResId, $script:CascSharedResId, $script:CascPlainResId)) {
        if ($rid) {
            $null = Invoke-WebRequest -Uri "$Base/resources/resource/$rid" -Method DELETE -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5
        }
    }
    "cleaned up surviving cascade-test resources"
}

# ========== Phase 13 — extra cleanup ==========

Step "DELETE attr-test resource" {
    if ($script:AttrResId) {
        $null = Invoke-WebRequest -Uri "$Base/resources/resource/$($script:AttrResId)" -Method DELETE -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5
        "deleted resource $($script:AttrResId)"
    } else { "no attr-test resource to delete" }
}

Step "DELETE sec-test resource" {
    if ($script:SecResId) {
        $null = Invoke-WebRequest -Uri "$Base/resources/resource/$($script:SecResId)" -Method DELETE -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5
        "deleted resource $($script:SecResId)"
    } else { "no sec-test resource to delete" }
}

Step "DELETE membership group" {
    if ($script:GroupMembId) {
        $null = Invoke-WebRequest -Uri "$Base/usergroups/group/$($script:GroupMembId)" -Method DELETE -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5
        "deleted group $($script:GroupMembId)"
    } else { "no membership group to delete" }
}

Step "DELETE new user" {
    if ($script:NewUserId) {
        $null = Invoke-WebRequest -Uri "$Base/users/user/$($script:NewUserId)" -Method DELETE -Headers @{Authorization=$AdminB} -UseBasicParsing -TimeoutSec 5
        "deleted user $($script:NewUserId)"
    } else { "no new user to delete" }
}

# ========== Summary ==========

Write-Host ""
Write-Host "===== Summary =====" -ForegroundColor Cyan
Write-Host "PASS: $global:Pass" -ForegroundColor Green
Write-Host "FAIL: $global:Fail" -ForegroundColor $(if ($global:Fail -gt 0) {'Red'} else {'Gray'})
Write-Host ""
$global:Results | Format-Table -AutoSize Step, Status, Name, Detail

if ($ResultsCsv) {
    try {
        $global:Results | Export-Csv -Path $ResultsCsv -NoTypeInformation -Encoding UTF8
        Write-Host "Results written to: $ResultsCsv"
    } catch {
        Write-Host "Could not write results CSV to '$ResultsCsv': $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# CI gate: non-zero exit on any failure.
if ($global:Fail -gt 0) { exit 1 } else { exit 0 }
