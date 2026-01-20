# BCM Platform - Quick Start (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BCM Platform - Quick Start Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"
Start-Sleep -Seconds 5
Write-Host "✓ Backend started on http://localhost:5000" -ForegroundColor Green
Write-Host ""

Write-Host "[2/4] Starting Admin Web App..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\admin-web'; npm run dev"
Start-Sleep -Seconds 3
Write-Host "✓ Admin Web started on http://localhost:3000" -ForegroundColor Green
Write-Host ""

Write-Host "[3/4] Starting Business Web App..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\business-web'; npm run dev"
Start-Sleep -Seconds 3
Write-Host "✓ Business Web started on http://localhost:3001" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All services started successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API:     http://localhost:5000" -ForegroundColor White
Write-Host "Admin Panel:     http://localhost:3000" -ForegroundColor White
Write-Host "Business Portal: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Default Login Credentials:" -ForegroundColor Yellow
Write-Host "- Admin:    admin@bcm.com / admin123" -ForegroundColor White
Write-Host "- Business: business@test.com / business123" -ForegroundColor White
Write-Host "- Investor: investor@test.com / investor123" -ForegroundColor White
Write-Host ""
Write-Host "Opening Admin Panel in browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
