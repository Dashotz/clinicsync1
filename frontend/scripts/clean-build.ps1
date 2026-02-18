# Clean Next.js cache and rebuild (fixes 400 on chunks when cache is stale)
# Run from repo root: .\frontend\scripts\clean-build.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Removing .next folder..." -ForegroundColor Yellow
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

Write-Host "Building..." -ForegroundColor Yellow
npm run build

Write-Host "Done. Start with: npm start" -ForegroundColor Green
