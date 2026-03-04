@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

REM ============================================================
REM  Autonomous-QA-Agent 작업 상태 확인
REM  - Daily (22:00 QA 점검) + Migrate (22:30 로그 마이그레이션)
REM ============================================================

set "PROJECT_ROOT=%~dp0..\.."
pushd "%PROJECT_ROOT%"
set "PROJECT_ROOT=%CD%"
popd
set "LOG_DIR=%PROJECT_ROOT%\scheduler\logs"

REM ============================================================
REM  1. Autonomous-QA-Agent-Daily
REM ============================================================
echo ============================================================
echo  [1/2] Autonomous-QA-Agent-Daily (QA 점검)
echo ============================================================
echo.

schtasks /query /tn "Autonomous-QA-Agent-Daily" >nul 2>&1
if %errorlevel% neq 0 (
    echo [상태] 미등록
    echo   - 등록하려면: npm run scheduler:register (관리자 권한 필요)
    goto :daily_logs
)

echo [상태] 등록됨
echo.

echo --- 스케줄러 정보 ---
for /f "tokens=1,* delims=:" %%a in ('schtasks /query /tn "Autonomous-QA-Agent-Daily" /v /fo LIST ^| findstr /i "상태 다음 실행 시간 마지막 실행 시간 마지막 결과 예약 유형 시작 시간"') do (
    set "key=%%a"
    set "val=%%b"
    if defined val (
        echo   !key!:!val!
    )
)

REM 영문 Windows 대응
for /f "tokens=1,* delims=:" %%a in ('schtasks /query /tn "Autonomous-QA-Agent-Daily" /v /fo LIST ^| findstr /i "Status Next.Run.Time Last.Run.Time Last.Result Schedule.Type Start.Time"') do (
    set "key=%%a"
    set "val=%%b"
    if defined val (
        echo   !key!:!val!
    )
)

:daily_logs
echo.
echo --- Daily 로그 ---

if not exist "%LOG_DIR%" (
    echo   로그 디렉토리 없음
    goto :check_daily_task_log
)

set "LATEST_LOG="
for /f "delims=" %%f in ('dir /b /o-d "%LOG_DIR%\run-*.json" 2^>nul') do (
    if not defined LATEST_LOG set "LATEST_LOG=%%f"
)

if defined LATEST_LOG (
    echo   최신 JSON 로그: %LOG_DIR%\!LATEST_LOG!
) else (
    echo   JSON 로그: 실행 기록 없음
)

:check_daily_task_log
set "TASK_LOG=%LOG_DIR%\task-scheduler.log"
if exist "%TASK_LOG%" (
    echo.
    echo --- task-scheduler.log (최근 5줄) ---
    powershell -NoProfile -Command "Get-Content '%TASK_LOG%' -Tail 5 | ForEach-Object { Write-Host ('  ' + $_) }"
) else (
    echo   task-scheduler.log: 파일 없음
)

REM ============================================================
REM  2. Autonomous-QA-Agent-Migrate
REM ============================================================
echo.
echo ============================================================
echo  [2/2] Autonomous-QA-Agent-Migrate (로그 마이그레이션)
echo ============================================================
echo.

schtasks /query /tn "Autonomous-QA-Agent-Migrate" >nul 2>&1
if %errorlevel% neq 0 (
    echo [상태] 미등록
    echo   - 등록하려면: npm run scheduler:register-migration (관리자 권한 필요)
    goto :migrate_logs
)

echo [상태] 등록됨
echo.

echo --- 스케줄러 정보 ---
for /f "tokens=1,* delims=:" %%a in ('schtasks /query /tn "Autonomous-QA-Agent-Migrate" /v /fo LIST ^| findstr /i "상태 다음 실행 시간 마지막 실행 시간 마지막 결과 예약 유형 시작 시간"') do (
    set "key=%%a"
    set "val=%%b"
    if defined val (
        echo   !key!:!val!
    )
)

REM 영문 Windows 대응
for /f "tokens=1,* delims=:" %%a in ('schtasks /query /tn "Autonomous-QA-Agent-Migrate" /v /fo LIST ^| findstr /i "Status Next.Run.Time Last.Run.Time Last.Result Schedule.Type Start.Time"') do (
    set "key=%%a"
    set "val=%%b"
    if defined val (
        echo   !key!:!val!
    )
)

:migrate_logs
echo.
echo --- Migration 로그 ---

set "MIGRATE_LOG=%LOG_DIR%\migration-task.log"
if exist "%MIGRATE_LOG%" (
    echo --- migration-task.log (최근 5줄) ---
    powershell -NoProfile -Command "Get-Content '%MIGRATE_LOG%' -Tail 5 | ForEach-Object { Write-Host ('  ' + $_) }"
) else (
    echo   migration-task.log: 파일 없음
)

echo.
echo ============================================================
echo  일괄 등록: npm run scheduler:register-all (관리자 권한)
echo  일괄 해제: npm run scheduler:unregister-all (관리자 권한)
echo ============================================================

endlocal
