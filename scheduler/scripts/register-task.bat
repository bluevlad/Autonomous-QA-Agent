@echo off
schtasks /create ^
  /tn "Autonomous-QA-Agent-Daily" ^
  /tr "cmd /c cd /d C:\GIT\Autonomous-QA-Agent && npm run scheduler:run >> scheduler\logs\task-scheduler.log 2>&1" ^
  /sc daily ^
  /st 22:00 ^
  /f
echo 등록 완료: Autonomous-QA-Agent-Daily (매일 22:00)
