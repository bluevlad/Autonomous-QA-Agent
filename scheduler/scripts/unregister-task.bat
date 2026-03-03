@echo off
chcp 65001 >nul 2>&1
setlocal

REM ============================================================
REM  Autonomous-QA-Agent-Daily 작업 스케줄러 제거
REM  - 관리자 권한 필요
REM ============================================================

REM 관리자 권한 확인
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] 관리자 권한이 필요합니다. 관리자 권한으로 다시 실행하세요.
    exit /b 1
)

REM 작업 존재 여부 확인
schtasks /query /tn "Autonomous-QA-Agent-Daily" >nul 2>&1
if %errorlevel% neq 0 (
    echo [정보] Autonomous-QA-Agent-Daily 작업이 등록되어 있지 않습니다.
    exit /b 0
)

REM 작업 삭제
schtasks /delete /tn "Autonomous-QA-Agent-Daily" /f

if %errorlevel% neq 0 (
    echo [오류] 작업 제거 실패
    exit /b 1
)

echo [완료] Autonomous-QA-Agent-Daily 제거 완료

endlocal
