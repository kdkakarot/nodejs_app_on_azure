# PDF Automation - Startup Script
# Run this script to start both backend and frontend servers

Write-Host "`n=== Starting PDF Automation ===" -ForegroundColor Cyan

# Start Backend
Write-Host "`n[1/2] Starting Backend API..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\OneDrive\Code explorations\NodeJS_app_on_Azure\backend'; Write-Host 'Backend API Server' -ForegroundColor Green; node dist/server.js"

Start-Sleep -Seconds 2

# Start Frontend
Write-Host "[2/2] Starting Frontend UI..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\OneDrive\Code explorations\NodeJS_app_on_Azure\frontend'; Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; Write-Host 'Frontend Dev Server' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 3

Write-Host "`nBoth servers starting..." -ForegroundColor Green
Write-Host "`nOpening browser in 5 seconds..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Start-Process "http://localhost:5173"

Write-Host "`nPDF Automation is running!" -ForegroundColor Green
Write-Host "  Backend: http://localhost:4000"
Write-Host "  Frontend: http://localhost:5173"
Write-Host "`nServers are running in separate windows. Close them when done."
