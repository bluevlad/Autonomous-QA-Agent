#!/bin/bash
# QA Dashboard - macOS OrbStack 배포 스크립트
# 사용법: ssh macbook "cd /path/to/Autonomous-QA-Agent && bash scheduler/scripts/deploy-dashboard.sh"

set -e

echo "=== QA Dashboard 배포 시작 ==="

# 1. PostgreSQL DB + 계정 생성
echo "[1/4] PostgreSQL 데이터베이스 생성..."
if psql -U postgres -lqt | grep -qw qa_dashboard; then
    echo "  DB 'qa_dashboard' 이미 존재, 스킵"
else
    psql -U postgres -f dashboard/backend/schema.sql
    echo "  DB + 테이블 + 계정 생성 완료"
fi

# 2. Docker Compose 빌드 + 실행
echo "[2/4] Docker Compose 빌드..."
cd dashboard
docker compose build --no-cache

echo "[3/4] Docker Compose 시작..."
docker compose up -d

# 4. Health Check
echo "[4/4] Health Check..."
sleep 3
if curl -sf http://localhost:9095/api/health > /dev/null 2>&1; then
    echo "  API (9095): OK"
else
    echo "  API (9095): FAIL - 로그 확인: docker compose logs qa-dashboard-api"
fi

if curl -sf http://localhost:4095 > /dev/null 2>&1; then
    echo "  Web (4095): OK"
else
    echo "  Web (4095): FAIL - 로그 확인: docker compose logs qa-dashboard-web"
fi

echo ""
echo "=== 배포 완료 ==="
echo "  Dashboard: http://172.30.1.72:4095"
echo "  API:       http://172.30.1.72:9095/api/health"
echo ""
echo "Windows에서 .env 설정 확인:"
echo "  DASHBOARD_API_URL=http://172.30.1.72:9095"
echo "  DASHBOARD_API_KEY=qa-agent-secret-key"
