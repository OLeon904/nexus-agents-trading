# Nexus Agents Trading - Full Setup Script
# Run this in PowerShell: .\setup.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot

Write-Host "`n=== Nexus Agents Trading - Setup ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node.js
Write-Host "[1/6] Checking Node.js..." -ForegroundColor Yellow
$nodePath = $null
if (Get-Command node -ErrorAction SilentlyContinue) { $nodePath = "node" }
elseif (Test-Path "C:\Program Files\nodejs\node.exe") { $nodePath = "C:\Program Files\nodejs\node.exe" }
elseif (Test-Path "$env:LOCALAPPDATA\Programs\node\node.exe") { $nodePath = "$env:LOCALAPPDATA\Programs\node\node.exe" }

if (-not $nodePath) {
    Write-Host "Node.js not found. Installing via winget..." -ForegroundColor Yellow
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    $nodePath = "node"
}

Write-Host "  Node.js found." -ForegroundColor Green

# 2. Install dependencies
Write-Host "`n[2/6] Installing dependencies..." -ForegroundColor Yellow
Set-Location $ProjectRoot
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
Write-Host "  Dependencies installed." -ForegroundColor Green

# 3. Create .env from example if missing
Write-Host "`n[3/6] Setting up environment..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  Created .env from .env.example" -ForegroundColor Green
    Write-Host "  IMPORTANT: Edit .env and add your DATABASE_URL (get free one at https://neon.tech)" -ForegroundColor Magenta
} else {
    Write-Host "  .env already exists." -ForegroundColor Green
}

# 4. Prisma generate
Write-Host "`n[4/6] Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) { throw "prisma generate failed" }
Write-Host "  Prisma client generated." -ForegroundColor Green

# 5. Database migration (requires valid DATABASE_URL)
Write-Host "`n[5/6] Running database migrations..." -ForegroundColor Yellow
$dbUrl = (Get-Content ".env" -Raw) -match 'DATABASE_URL="([^"]+)"'
if ($Matches -and $Matches[1] -notmatch "localhost|user:password") {
    npx prisma migrate deploy 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Host "  Migrations applied." -ForegroundColor Green }
    else { Write-Host "  Skipped (add valid DATABASE_URL to .env first)" -ForegroundColor Yellow }
} else {
    Write-Host "  Skipped (add valid DATABASE_URL to .env, then run: npx prisma migrate deploy)" -ForegroundColor Yellow
}

# 6. Build check
Write-Host "`n[6/6] Verifying build..." -ForegroundColor Yellow
npm run build 2>$null
if ($LASTEXITCODE -eq 0) { Write-Host "  Build successful." -ForegroundColor Green }
else { Write-Host "  Build had issues (may need DATABASE_URL for Prisma)" -ForegroundColor Yellow }

Write-Host "`n=== Setup complete ===" -ForegroundColor Cyan
Write-Host "`nNext steps:"
Write-Host "  1. Get free database: https://neon.tech (sign up, create project, copy connection string)"
Write-Host "  2. Add DATABASE_URL to .env"
Write-Host "  3. Run: npx prisma migrate deploy"
Write-Host "  4. Run: npm run dev"
Write-Host "  5. Deploy to AWS: See docs/AWS-DEPLOYMENT.md`n"
