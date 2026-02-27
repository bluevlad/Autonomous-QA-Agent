@echo off
schtasks /delete /tn "Autonomous-QA-Agent-Daily" /f
echo 제거 완료: Autonomous-QA-Agent-Daily
