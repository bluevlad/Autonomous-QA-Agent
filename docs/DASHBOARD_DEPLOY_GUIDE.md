# QA Dashboard 배포 가이드 (macOS OrbStack)

> 배포 대상: macOS OrbStack (172.30.1.72)
> 최종 수정: 2026-03-04

## 아키텍처 개요

```
Windows (172.30.1.100)                    macOS OrbStack (172.30.1.72)
┌─────────────────────┐                   ┌──────────────────────────────┐
│ QA Agent Scheduler   │                   │ Docker                       │
│ (매일 22:00 실행)     │ ── HTTP POST ──→ │ ┌──────────────────────────┐ │
│                      │    /api/ingest    │ │ qa-dashboard-api (:9095)  │ │
│ .env                 │                   │ │ FastAPI + asyncpg          │ │
│ DASHBOARD_API_URL    │                   │ └──────────┬───────────────┘ │
│ DASHBOARD_API_KEY    │                   │            │                 │
│                      │                   │ ┌──────────▼───────────────┐ │
│                      │ ── HTTP GET ────→ │ │ PostgreSQL (:5432)       │ │
│                      │    :4095          │ │ DB: qa_dashboard          │ │
│                      │                   │ │ User: qa_dashboard_svc    │ │
│                      │                   │ └──────────────────────────┘ │
│                      │                   │                              │
│ 브라우저              │ ── HTTP GET ────→ │ ┌──────────────────────────┐ │
│                      │    :4095          │ │ qa-dashboard-web (:4095)  │ │
│                      │                   │ │ React + nginx              │ │
│                      │                   │ │ /api → api:8000 프록시     │ │
│                      │                   │ └──────────────────────────┘ │
└─────────────────────┘                   └──────────────────────────────┘
```

- **PostgreSQL**: Docker 외부 (호스트)에 설치, 컨테이너는 `host.docker.internal:5432`로 접근
- **Backend (FastAPI)**: 포트 9095 → 컨테이너 내부 8000
- **Frontend (React + nginx)**: 포트 4095 → 컨테이너 내부 80, `/api/` 요청을 backend로 프록시

---

## 전제 조건

| 항목 | 최소 버전 | 확인 명령 |
|------|----------|----------|
| Docker (OrbStack) | 20+ | `docker --version` |
| Docker Compose | v2 | `docker compose version` |
| PostgreSQL | 14+ | `psql --version` |
| Git | 2.30+ | `git --version` |

---

## 배포 절차

### Step 1. 저장소 클론 + 최신 코드

```bash
# 최초 클론 (이미 있으면 git pull)
cd ~/projects  # 또는 원하는 경로
git clone https://github.com/bluevlad/Autonomous-QA-Agent.git
cd Autonomous-QA-Agent
git checkout main && git pull origin main
```

### Step 2. PostgreSQL DB + 계정 생성

```bash
# PostgreSQL이 실행 중인지 확인
pg_isready

# DB + 계정 + 테이블 + 인덱스 + 트리거 일괄 생성
psql -U postgres -f dashboard/backend/schema.sql
```

**생성되는 항목:**
- DB: `qa_dashboard`
- User: `qa_dashboard_svc` (비밀번호: `qa_dashboard_pass`)
- 7개 테이블: `qa_runs`, `qa_health_results`, `qa_endpoint_results`, `qa_test_results`, `qa_failure_details`, `qa_suggestions`, `qa_issue_results`
- 인덱스 10개 + tsvector 트리거 2개 + cleanup 함수 1개

**검증:**
```bash
psql -U qa_dashboard_svc -d qa_dashboard -c "\dt"
# 7개 테이블이 출력되면 정상
```

> **비밀번호 변경 시**: `schema.sql`에서 비밀번호 수정 + `docker-compose.yml`의 `QA_DASHBOARD_DATABASE_URL`도 함께 변경

### Step 3. Docker Compose 빌드 + 실행

```bash
cd dashboard

# 빌드 (최초 or 코드 변경 시)
docker compose build --no-cache

# 실행
docker compose up -d
```

**환경변수 커스터마이징** (필요 시 `docker-compose.yml` 수정):

| 환경변수 | 기본값 | 설명 |
|---------|--------|------|
| `QA_DASHBOARD_DATABASE_URL` | `postgresql://qa_dashboard_svc:qa_dashboard_pass@host.docker.internal:5432/qa_dashboard` | PostgreSQL DSN |
| `QA_DASHBOARD_API_KEY` | `qa-agent-secret-key` | API 인증 키 (Windows .env와 일치 필수) |
| `QA_DASHBOARD_CORS_ORIGINS` | `*` | CORS 허용 도메인 |

### Step 4. Health Check 확인

```bash
# API 상태 확인
curl -s http://localhost:9095/api/health | python3 -m json.tool

# 기대 응답:
# {
#     "status": "ok",
#     "database": "connected",
#     "pool_size": 2
# }

# Web 접속 확인
curl -s -o /dev/null -w "%{http_code}" http://localhost:4095
# 기대 응답: 200
```

**외부 접근 (Windows에서):**
```bash
curl -s http://172.30.1.72:9095/api/health
# 브라우저: http://172.30.1.72:4095
```

---

## 배포 후 Windows 설정 (개발 PC)

### .env 파일 생성

Windows 개발 PC (`C:\GIT\Autonomous-QA-Agent\.env`):

```env
# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../XXX

# Dashboard (macOS OrbStack)
DASHBOARD_API_URL=http://172.30.1.72:9095
DASHBOARD_API_KEY=qa-agent-secret-key
```

### 기존 로그 마이그레이션 (선택)

```bash
# 미전송 로그만 DB로 마이그레이션
npm run migrate:logs

# 전체 재전송 (강제)
npm run migrate:logs -- --all
```

### Windows Task Scheduler 재등록

```bash
# 관리자 권한 필요
npm run scheduler:register
```

### 전송 테스트

```bash
# 즉시 1회 실행으로 Dashboard 전송 확인
npm run scheduler:run
# [Phase 3.5] Dashboard 전송... 이 출력되는지 확인
# [Phase 3.5] 전송 완료 → 성공
```

---

## 운영 관리

### 컨테이너 관리

```bash
cd ~/projects/Autonomous-QA-Agent/dashboard

# 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f qa-dashboard-api     # API 로그
docker compose logs -f qa-dashboard-web     # Web 로그

# 재시작
docker compose restart

# 중지
docker compose down

# 코드 업데이트 후 재배포
git pull origin main
docker compose build --no-cache && docker compose up -d
```

### 데이터 정리 (보관 정책)

```bash
# API를 통한 정리 (기본 90일)
curl -X POST http://localhost:9095/api/cleanup \
  -H "Authorization: Bearer qa-agent-secret-key"

# 직접 SQL 실행
psql -U qa_dashboard_svc -d qa_dashboard -c "SELECT * FROM qa_cleanup(90);"
```

보관 정책:
- 상세 데이터 (failure_details, endpoint_results): **90일**
- raw_json: **60일** 후 NULL 처리
- 집계 데이터 (qa_runs, health_results, test_results): **1년**

### DB 백업

```bash
# 전체 백업
pg_dump -U qa_dashboard_svc qa_dashboard > backup_$(date +%Y%m%d).sql

# 복원
psql -U postgres -d qa_dashboard < backup_YYYYMMDD.sql
```

---

## 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| API health 실패 | PostgreSQL 미실행 | `pg_isready` 확인, `brew services start postgresql` |
| `host.docker.internal` 연결 실패 | OrbStack DNS 문제 | `docker compose down && docker compose up -d` 재시작 |
| Windows에서 Dashboard 접속 불가 | macOS 방화벽 | `sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off` |
| Web에서 API 호출 실패 (CORS) | CORS 설정 | `docker-compose.yml`의 `QA_DASHBOARD_CORS_ORIGINS` 확인 |
| 전송 시 `401 Unauthorized` | API Key 불일치 | Windows `.env`의 `DASHBOARD_API_KEY`와 `docker-compose.yml`의 값 일치 확인 |
| `psql: FATAL: role "postgres" does not exist` | macOS PostgreSQL 기본 계정 | `psql -U $(whoami) postgres`로 접속 후 `CREATE ROLE postgres SUPERUSER LOGIN;` |

---

## 포트 요약

| 서비스 | 포트 | 용도 |
|--------|------|------|
| qa-dashboard-api | **9095** | FastAPI Backend (REST API) |
| qa-dashboard-web | **4095** | React Frontend (nginx) |
| PostgreSQL | **5432** | 호스트 PostgreSQL (Docker 외부) |

> 기존 서비스 포트(4040, 4055, 4060, 4070, 9040, 9050, 9060, 9070)와 충돌 없음
