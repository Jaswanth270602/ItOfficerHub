# Start ItOfficerHub on http://localhost:8080 (API + UI)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

if (-not (Test-Path ".env")) {
  Write-Host "ERROR: Missing .env file. Run: copy .env.example .env" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path "src\main\resources\static\index.html")) {
  Write-Host "Building frontend into static..." -ForegroundColor Yellow
  & "$root\scripts\build-static.ps1"
}

Write-Host "Starting Spring Boot on port 8080..." -ForegroundColor Cyan
& "$root\mvnw.cmd" spring-boot:run "-Dskip.frontend.build=true"
