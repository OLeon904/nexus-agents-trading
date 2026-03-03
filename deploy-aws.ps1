# One-click AWS Amplify deployment helper
# Prerequisites: AWS CLI configured (aws configure)
# Run: .\deploy-aws.ps1

$ErrorActionPreference = "Stop"

Write-Host "`n=== AWS Amplify Deployment ===" -ForegroundColor Cyan

# Check AWS CLI
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "AWS CLI not found. Install from: https://aws.amazon.com/cli/" -ForegroundColor Red
    Write-Host "`nAlternatively, deploy via Console:" -ForegroundColor Yellow
    Write-Host "  1. Go to https://console.aws.amazon.com/amplify/" -ForegroundColor White
    Write-Host "  2. New app -> Host web app -> GitHub" -ForegroundColor White
    Write-Host "  3. Select OLeon904/nexus-agents-trading" -ForegroundColor White
    Write-Host "  4. Add DATABASE_URL env var" -ForegroundColor White
    exit 1
}

$AppName = "nexus-agents-trading"
$Repo = "https://github.com/OLeon904/nexus-agents-trading"

Write-Host "Creating Amplify app..." -ForegroundColor Yellow
aws amplify create-app --name $AppName --platform WEB

Write-Host "`nNote: Connecting to GitHub requires the AWS Console (one-time OAuth)." -ForegroundColor Magenta
Write-Host "Go to: https://console.aws.amazon.com/amplify/" -ForegroundColor White
Write-Host "  -> Select your app -> Connect repository -> GitHub -> Authorize" -ForegroundColor White
