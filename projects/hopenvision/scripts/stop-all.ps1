# HopenVision 서비스 중지 스크립트 (Windows)

Write-Host "=== HopenVision 서비스 중지 ===" -ForegroundColor Yellow
Write-Host ""

$projectRoot = "C:\GIT\hopenvision"

# 1. Frontend 중지 (Vite dev server)
Write-Host "[1/3] Frontend 중지..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
    $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
    if ($cmdLine -like "*vite*" -or $cmdLine -like "*hopenvision*") {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        Write-Host "      Node process stopped: $($_.Id)" -ForegroundColor Gray
    }
}

# 2. Backend 중지 (Spring Boot)
Write-Host "[2/3] Backend 중지..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | ForEach-Object {
    $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
    if ($cmdLine -like "*hopenvision*") {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        Write-Host "      Java process stopped: $($_.Id)" -ForegroundColor Gray
    }
}

# 3. Docker 컨테이너 중지
Write-Host "[3/3] Docker 컨테이너 중지..." -ForegroundColor Yellow
Set-Location $projectRoot
docker compose down

Write-Host ""
Write-Host "=== 서비스 중지 완료 ===" -ForegroundColor Green
