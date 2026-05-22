# Build React app and copy into Spring Boot static (for manual deploy)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Push-Location "$root\frontend"
if (-not $env:VITE_API_URL) { $env:VITE_API_URL = "" }
if (Test-Path "node_modules") {
  npm run build
} else {
  npm ci
  npm run build
}
Pop-Location

$staticDir = "$root\src\main\resources\static"
if (Test-Path $staticDir) { Remove-Item -Recurse -Force $staticDir }
New-Item -ItemType Directory -Path $staticDir | Out-Null
Copy-Item -Recurse "$root\frontend\dist\*" $staticDir
Write-Host "Copied frontend/dist -> src/main/resources/static"
