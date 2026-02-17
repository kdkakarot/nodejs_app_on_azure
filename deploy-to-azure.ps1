# Azure Deployment Automation Script
# This script automates the deployment of PDF Automation to Azure

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "pdf-automation-rg",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("B1", "B2", "S1")]
    [string]$AppServiceSku = "B2",
    
    [Parameter(Mandatory=$false)]
    [string]$WebAppName = "pdf-automation-" + (Get-Random -Maximum 9999)
)

Write-Host "`n=== Azure PDF Automation Deployment ===" -ForegroundColor Cyan
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor Yellow
Write-Host "Location: $Location" -ForegroundColor Yellow
Write-Host "App Service SKU: $AppServiceSku" -ForegroundColor Yellow
Write-Host "Web App Name: $WebAppName" -ForegroundColor Yellow
Write-Host "`n"

# Check if Azure CLI is installed
try {
    az version | Out-Null
    Write-Host "✓ Azure CLI detected" -ForegroundColor Green
} catch {
    Write-Host "✗ Azure CLI not found. Installing..." -ForegroundColor Red
    Write-Host "Run: winget install Microsoft.AzureCLI" -ForegroundColor Yellow
    exit 1
}

# Login check
Write-Host "`n[1/10] Checking Azure login..." -ForegroundColor Cyan
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "Not logged in. Running az login..." -ForegroundColor Yellow
    az login
} else {
    Write-Host "✓ Logged in as: $($account.user.name)" -ForegroundColor Green
}

# Create Resource Group
Write-Host "`n[2/10] Creating Resource Group..." -ForegroundColor Cyan
az group create --name $ResourceGroup --location $Location --output none
Write-Host "✓ Resource Group created" -ForegroundColor Green

# Create Storage Account
Write-Host "`n[3/10] Creating Storage Account..." -ForegroundColor Cyan
$storageAccount = "pdfauto" + (Get-Random -Maximum 99999)
az storage account create `
    --name $storageAccount `
    --resource-group $ResourceGroup `
    --location $Location `
    --sku Standard_LRS `
    --kind StorageV2 `
    --output none
Write-Host "✓ Storage Account created: $storageAccount" -ForegroundColor Green

# Get Connection String
Write-Host "`n[4/10] Getting Storage Connection String..." -ForegroundColor Cyan
$connectionString = az storage account show-connection-string `
    --name $storageAccount `
    --resource-group $ResourceGroup `
    --query connectionString `
    --output tsv
Write-Host "✓ Connection string retrieved" -ForegroundColor Green

# Create Blob Containers
Write-Host "`n[5/10] Creating Blob Containers..." -ForegroundColor Cyan
az storage container create `
    --name "input-pdfs" `
    --account-name $storageAccount `
    --connection-string $connectionString `
    --output none

az storage container create `
    --name "output-extracts" `
    --account-name $storageAccount `
    --connection-string $connectionString `
    --output none
Write-Host "✓ Containers created: input-pdfs, output-extracts" -ForegroundColor Green

# Create App Service Plan
Write-Host "`n[6/10] Creating App Service Plan..." -ForegroundColor Cyan
$appServicePlan = "$ResourceGroup-plan"
az appservice plan create `
    --name $appServicePlan `
    --resource-group $ResourceGroup `
    --sku $AppServiceSku `
    --is-linux `
    --output none
Write-Host "✓ App Service Plan created: $appServicePlan ($AppServiceSku)" -ForegroundColor Green

# Create Web App
Write-Host "`n[7/10] Creating Web App..." -ForegroundColor Cyan
az webapp create `
    --name $WebAppName `
    --resource-group $ResourceGroup `
    --plan $appServicePlan `
    --runtime "NODE:20-lts" `
    --output none
Write-Host "✓ Web App created: $WebAppName" -ForegroundColor Green

# Configure App Settings
Write-Host "`n[8/10] Configuring App Settings..." -ForegroundColor Cyan
az webapp config appsettings set `
    --name $WebAppName `
    --resource-group $ResourceGroup `
    --settings `
        AZURE_STORAGE_CONNECTION_STRING=$connectionString `
        PORT=8080 `
        NODE_ENV=production `
    --output none
Write-Host "✓ App settings configured" -ForegroundColor Green

# Build and Package Application
Write-Host "`n[9/10] Building and Packaging Application..." -ForegroundColor Cyan

# Build Frontend
Write-Host "  Building frontend..." -ForegroundColor Yellow
Push-Location "frontend"
npm run build 2>&1 | Out-Null
Pop-Location

# Build Backend
Write-Host "  Building backend..." -ForegroundColor Yellow
Push-Location "backend"
npm run build 2>&1 | Out-Null
Pop-Location

# Create deployment package
Write-Host "  Creating deployment package..." -ForegroundColor Yellow
Remove-Item -Path "deploy" -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path "deploy" -Force | Out-Null

Copy-Item -Path "backend\dist" -Destination "deploy\dist" -Recurse -Force
Copy-Item -Path "backend\package.json" -Destination "deploy\" -Force
Copy-Item -Path "backend\package-lock.json" -Destination "deploy\" -Force
Copy-Item -Path "frontend\dist" -Destination "deploy\public" -Recurse -Force
Copy-Item -Path "pdf_processin_exe\pdf_processor.exe" -Destination "deploy\" -Force

# Create startup script
$startupScript = @"
#!/bin/bash
echo "Installing production dependencies..."
npm ci --omit=dev
echo "Starting PDF Automation..."
node dist/server.js
"@
Set-Content -Path "deploy\startup.sh" -Value $startupScript

# Create ZIP
Push-Location "deploy"
Compress-Archive -Path * -DestinationPath "..\app.zip" -Force
Pop-Location

Write-Host "✓ Application packaged" -ForegroundColor Green

# Deploy to Azure
Write-Host "`n[10/10] Deploying to Azure..." -ForegroundColor Cyan
az webapp deployment source config-zip `
    --name $WebAppName `
    --resource-group $ResourceGroup `
    --src "app.zip" `
    --timeout 300 `
    --output none

# Configure startup command
az webapp config set `
    --name $WebAppName `
    --resource-group $ResourceGroup `
    --startup-file "startup.sh" `
    --output none

Write-Host "✓ Deployment complete" -ForegroundColor Green

# Get App URL
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

$appUrl = az webapp show `
    --name $WebAppName `
    --resource-group $ResourceGroup `
    --query defaultHostName `
    --output tsv

Write-Host "📊 Deployment Summary:" -ForegroundColor Yellow
Write-Host "  Resource Group: $ResourceGroup"
Write-Host "  Storage Account: $storageAccount"
Write-Host "  App Service Plan: $appServicePlan ($AppServiceSku)"
Write-Host "  Web App: $WebAppName"
Write-Host "`n🌐 Your application is available at:" -ForegroundColor Green
Write-Host "  https://$appUrl`n" -ForegroundColor Cyan

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Visit your application: https://$appUrl"
Write-Host "  2. Upload PDF files to test"
Write-Host "  3. Monitor with: az webapp log tail --name $WebAppName --resource-group $ResourceGroup"
Write-Host "  4. View in Azure Portal: https://portal.azure.com"
Write-Host "`n💰 Estimated Monthly Cost:" -ForegroundColor Yellow
switch ($AppServiceSku) {
    "B1" { Write-Host "  ~`$15-25/month" -ForegroundColor Green }
    "B2" { Write-Host "  ~`$60-70/month" -ForegroundColor Green }
    "S1" { Write-Host "  ~`$75-85/month" -ForegroundColor Green }
}

# Clean up local deployment files
Write-Host "`n🧹 Cleaning up local files..." -ForegroundColor Yellow
Remove-Item -Path "deploy" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "app.zip" -Force -ErrorAction SilentlyContinue
Write-Host "✓ Cleanup complete`n" -ForegroundColor Green

# Prompt to open browser
$response = Read-Host "Would you like to open the application in your browser? (Y/N)"
if ($response -eq 'Y' -or $response -eq 'y') {
    Start-Process "https://$appUrl"
}
