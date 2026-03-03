@echo off
REM Autonomous QA Agent - Windows Task Scheduler 등록
REM 매일 22:00에 QA 점검 실행 (Health Check + Playwright + Dashboard 전송 + Slack)

schtasks /create /tn "Autonomous-QA-Agent-Daily" /tr "cmd /c cd /d C:\GIT\Autonomous-QA-Agent ^&^& npm run scheduler:run >> scheduler\logs\task-scheduler.log 2^>^&1" /sc daily /st 22:00 /f
echo.
echo [OK] 등록 완료: Autonomous-QA-Agent-Daily (매일 22:00)
echo [INFO] Dashboard 전송: .env의 DASHBOARD_API_URL 설정 시 자동 활성화
echo [INFO] 로그: scheduler\logs\task-scheduler.log
