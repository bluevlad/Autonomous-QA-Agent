#!/bin/bash
set -e

echo "=== HopenVision Production Deployment ==="
echo ""

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "[1/5] Pulling latest code from prod branch..."
git fetch origin
git checkout prod
git pull origin prod

echo "[2/5] Stopping existing services..."
docker compose -f docker-compose.prod.yml down --timeout 30 || true

echo "[3/5] Building Docker images..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "[4/5] Starting services..."
docker compose -f docker-compose.prod.yml up -d

echo "[5/5] Waiting for services to be ready..."
sleep 60

echo ""
echo "=== Health Check ==="
if curl -f -s -o /dev/null http://localhost:4060; then
    echo "  Frontend (4060): OK"
else
    echo "  Frontend (4060): FAILED"
fi

if curl -f -s -o /dev/null "http://localhost:9050/api/exams?page=0&size=1"; then
    echo "  Backend  (9050): OK"
else
    echo "  Backend  (9050): FAILED"
fi

echo ""
echo "=== Deployment Complete ==="
echo "  Frontend: http://localhost:4060"
echo "  Backend:  http://localhost:9050"
echo "  Swagger:  http://localhost:4060/swagger-ui.html"
echo "  Database: localhost:5432"
