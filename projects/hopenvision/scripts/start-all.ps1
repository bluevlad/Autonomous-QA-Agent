# HopenVision 서비스 시작 스크립트 (Windows)

Write-Host "=== HopenVision 서비스 시작 ===" -ForegroundColor Green
Write-Host ""

$projectRoot = "C:\GIT\hopenvision"

# 1. 데이터베이스 시작
Write-Host "[1/3] 데이터베이스 시작..." -ForegroundColor Yellow
Set-Location $projectRoot
docker compose up -d hopenvision-db

Write-Host "      데이터베이스 준비 대기 (10초)..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# 2. Backend 시작
Write-Host "[2/3] Backend 시작..." -ForegroundColor Yellow
$apiPath = Join-Path $projectRoot "api"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d $apiPath && gradlew.bat bootRun" -WindowStyle Normal

Write-Host "      Backend 준비 대기 (15초)..." -ForegroundColor Gray
Start-Sleep -Seconds 15

# 3. Frontend 시작
Write-Host "[3/3] Frontend 시작..." -ForegroundColor Yellow
$webPath = Join-Path $projectRoot "web"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d $webPath && npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "=== 서비스 시작 완료 ===" -ForegroundColor Green
Write-Host ""
Write-Host "접속 URL:" -ForegroundColor Cyan
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor White
Write-Host "  Backend  : http://localhost:8080" -ForegroundColor White
Write-Host "  Swagger  : http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host "  Database : localhost:5432 (hopenvision/***REMOVED***)" -ForegroundColor White
Write-Host ""
