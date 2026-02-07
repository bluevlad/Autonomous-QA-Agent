# HopenVision 서비스 상태 확인 스크립트 (Windows)

Write-Host "=== HopenVision 서비스 상태 ===" -ForegroundColor Cyan
Write-Host ""

# Docker 컨테이너 상태
Write-Host "[Docker Containers]" -ForegroundColor Yellow
$containers = docker ps --filter "name=hopenvision" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null
if ($containers) {
    Write-Host $containers
} else {
    Write-Host "  No running containers" -ForegroundColor Gray
}
Write-Host ""

# 포트 상태 확인
Write-Host "[Port Status]" -ForegroundColor Yellow
$ports = @(
    @{Port=5432; Name="PostgreSQL"},
    @{Port=8080; Name="Backend (Spring Boot)"},
    @{Port=5173; Name="Frontend (Vite Dev)"},
    @{Port=4050; Name="Frontend (Docker)"},
    @{Port=9050; Name="Backend (Docker)"}
)

foreach ($p in $ports) {
    $result = Test-NetConnection -ComputerName localhost -Port $p.Port -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($result) {
        Write-Host "  $($p.Port) ($($p.Name)): " -NoNewline
        Write-Host "OPEN" -ForegroundColor Green
    } else {
        Write-Host "  $($p.Port) ($($p.Name)): " -NoNewline
        Write-Host "CLOSED" -ForegroundColor Red
    }
}
Write-Host ""

# API 헬스 체크
Write-Host "[API Health Check]" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  Backend API: " -NoNewline
    Write-Host "UP" -ForegroundColor Green
} catch {
    Write-Host "  Backend API: " -NoNewline
    Write-Host "DOWN" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  Frontend:    " -NoNewline
    Write-Host "UP" -ForegroundColor Green
} catch {
    Write-Host "  Frontend:    " -NoNewline
    Write-Host "DOWN" -ForegroundColor Red
}
Write-Host ""
