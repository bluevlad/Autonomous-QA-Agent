@echo off
chcp 65001 >nul 2>&1
setlocal

REM ============================================================
REM  Autonomous-QA-Agent-Migrate 작업 스케줄러 등록
REM  - 매일 22:30에 미전송 로그 → Dashboard DB 마이그레이션
REM  - 관리자 권한 필요
REM ============================================================

REM 프로젝트 루트 동적 해석 (%~dp0 = scripts/, ..\.. = 프로젝트 루트)
set "PROJECT_ROOT=%~dp0..\.."
pushd "%PROJECT_ROOT%"
set "PROJECT_ROOT=%CD%"
popd

REM 관리자 권한 확인
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] 관리자 권한이 필요합니다. 관리자 권한으로 다시 실행하세요.
    exit /b 1
)

REM 로그 디렉토리 생성
if not exist "%PROJECT_ROOT%\scheduler\logs" (
    mkdir "%PROJECT_ROOT%\scheduler\logs"
    echo [정보] 로그 디렉토리 생성: %PROJECT_ROOT%\scheduler\logs
)

REM 기존 작업 삭제 (존재 시)
schtasks /query /tn "Autonomous-QA-Agent-Migrate" >nul 2>&1
if %errorlevel% equ 0 (
    echo [정보] 기존 작업을 삭제합니다...
    schtasks /delete /tn "Autonomous-QA-Agent-Migrate" /f >nul 2>&1
)

REM 작업 등록
echo [정보] 작업을 등록합니다...
schtasks /create ^
  /tn "Autonomous-QA-Agent-Migrate" ^
  /tr "cmd /c cd /d \"%PROJECT_ROOT%\" && npm run migrate:logs >> scheduler\logs\migration-task.log 2>&1" ^
  /sc daily /st 22:30 /f

if %errorlevel% neq 0 (
    echo [오류] 작업 등록 실패
    exit /b 1
)

REM 등록 검증
schtasks /query /tn "Autonomous-QA-Agent-Migrate" /fo LIST >nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] 등록 검증 실패 - 작업이 조회되지 않습니다.
    exit /b 1
)

echo.
echo [완료] Autonomous-QA-Agent-Migrate 등록 성공
echo   - 경로: %PROJECT_ROOT%
echo   - 스케줄: 매일 22:30 (QA 점검 완료 후 30분 대기)
echo   - 로그: scheduler\logs\migration-task.log
echo   - 대상: .env의 DASHBOARD_API_URL로 미전송 로그 DB 전송

endlocal
