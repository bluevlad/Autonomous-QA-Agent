# QA Agent DB Schema Design Guide

개발 서버에서 QA 배치 실행 결과를 DB에 저장할 때 참고하는 스키마 설계 가이드.
현재 Dashboard는 JSON 파일 기반이며, 이 스키마대로 DB를 구축하면 `DataSource` 인터페이스 구현만 교체하여 바로 연동 가능.

---

## 1. ERD

```
┌──────────────┐
│   projects   │
│──────────────│
│ PK id        │
│    name      │───────────────────────┐
│    created_at│                       │
└──────────────┘                       │
                                       │
┌──────────────┐  ┌─────────────────┐  │  ┌─────────────────────┐
│     runs     │  │  health_checks  │  │  │    test_results     │
│──────────────│  │─────────────────│  │  │─────────────────────│
│ PK id        │──│ FK run_id       │  │  │ FK run_id           │──┐
│    run_id    │  │ FK project_id   │──┘  │ FK project_id       │  │
│    started_at│  │    healthy      │     │    executed          │  │
│    finished  │  │    checked_at   │     │    passed            │  │
│    duration  │  └────────┬────────┘     │    failed            │  │
│    summary_* │           │              │    skipped           │  │
└──────────────┘           │              │    total             │  │
                           │              │    exit_code         │  │
                  ┌────────┴────────┐     │    duration_ms       │  │
                  │   endpoints     │     └─────────────────────┘  │
                  │─────────────────│                               │
                  │ FK health_id    │     ┌─────────────────────┐  │
                  │    url          │     │   test_failures     │  │
                  │    label        │     │─────────────────────│  │
                  │    healthy      │     │ FK test_result_id   │──┘
                  │    status_code  │     │    test_name        │
                  │    response_ms  │     │    error_message    │
                  │    error        │     └─────────────────────┘
                  └─────────────────┘
                                          ┌─────────────────────┐
                                          │   issue_reports     │
                                          │─────────────────────│
                                          │ FK run_id           │
                                          │ FK project_id       │
                                          │    action           │
                                          │    issue_url        │
                                          │    issue_number     │
                                          └─────────────────────┘
```

---

## 2. DDL (PostgreSQL)

```sql
-- 프로젝트 마스터
CREATE TABLE projects (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- QA 실행 단위 (배치 1회 = 1 row)
CREATE TABLE runs (
    id                SERIAL PRIMARY KEY,
    run_id            VARCHAR(20)  NOT NULL UNIQUE,  -- '20260302-2200' 형식
    started_at        TIMESTAMPTZ  NOT NULL,
    finished_at       TIMESTAMPTZ,
    duration_ms       INTEGER,
    -- 비정규화된 요약 (Dashboard 조회 성능용)
    total_projects    SMALLINT NOT NULL DEFAULT 0,
    healthy_projects  SMALLINT NOT NULL DEFAULT 0,
    tested_projects   SMALLINT NOT NULL DEFAULT 0,
    total_tests       INTEGER  NOT NULL DEFAULT 0,
    total_passed      INTEGER  NOT NULL DEFAULT 0,
    total_failed      INTEGER  NOT NULL DEFAULT 0,
    total_skipped     INTEGER  NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 프로젝트별 헬스체크 결과
CREATE TABLE health_checks (
    id          SERIAL PRIMARY KEY,
    run_id      INTEGER     NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    project_id  INTEGER     NOT NULL REFERENCES projects(id),
    healthy     BOOLEAN     NOT NULL,
    checked_at  TIMESTAMPTZ NOT NULL,
    UNIQUE (run_id, project_id)
);

-- 헬스체크 엔드포인트 상세
CREATE TABLE endpoints (
    id              SERIAL PRIMARY KEY,
    health_check_id INTEGER      NOT NULL REFERENCES health_checks(id) ON DELETE CASCADE,
    url             VARCHAR(500) NOT NULL,
    label           VARCHAR(100) NOT NULL,
    healthy         BOOLEAN      NOT NULL,
    status_code     SMALLINT,
    response_time_ms NUMERIC(8,2),
    error           TEXT
);

-- 프로젝트별 테스트 실행 결과
CREATE TABLE test_results (
    id              SERIAL PRIMARY KEY,
    run_id          INTEGER      NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    project_id      INTEGER      NOT NULL REFERENCES projects(id),
    executed        BOOLEAN      NOT NULL DEFAULT true,
    skipped_reason  TEXT,
    passed          INTEGER      NOT NULL DEFAULT 0,
    failed          INTEGER      NOT NULL DEFAULT 0,
    skipped         INTEGER      NOT NULL DEFAULT 0,
    total           INTEGER      NOT NULL DEFAULT 0,
    exit_code       SMALLINT,
    duration_ms     INTEGER      NOT NULL DEFAULT 0,
    UNIQUE (run_id, project_id)
);

-- 실패한 개별 테스트 케이스
CREATE TABLE test_failures (
    id              SERIAL PRIMARY KEY,
    test_result_id  INTEGER      NOT NULL REFERENCES test_results(id) ON DELETE CASCADE,
    test_name       VARCHAR(500) NOT NULL,
    error_message   TEXT         NOT NULL
);

-- GitHub 이슈 리포트
CREATE TABLE issue_reports (
    id            SERIAL PRIMARY KEY,
    run_id        INTEGER      NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    project_id    INTEGER      NOT NULL REFERENCES projects(id),
    action        VARCHAR(20)  NOT NULL,  -- 'created' | 'updated' | 'closed'
    issue_url     VARCHAR(500) NOT NULL,
    issue_number  INTEGER      NOT NULL,
    error         TEXT
);
```

---

## 3. 인덱스

```sql
-- 실행 이력 조회 (최신순)
CREATE INDEX idx_runs_started_at ON runs (started_at DESC);

-- 프로젝트별 이력 조회
CREATE INDEX idx_health_checks_project ON health_checks (project_id, run_id);
CREATE INDEX idx_test_results_project  ON test_results  (project_id, run_id);

-- 트렌드 조회
CREATE INDEX idx_runs_run_id ON runs (run_id);
```

---

## 4. Dashboard API ↔ DB 쿼리 매핑

### `GET /api/runs` — 실행 목록

```sql
SELECT run_id, started_at, finished_at, duration_ms,
       healthy_projects, total_projects,
       total_passed, total_failed, total_skipped, total_tests
FROM runs
ORDER BY started_at DESC
LIMIT 50;
```

### `GET /api/runs/latest` — 최신 실행 상세

```sql
-- 1) run 기본 정보
SELECT * FROM runs ORDER BY started_at DESC LIMIT 1;

-- 2) 해당 run의 health_checks + endpoints (run.id = $1)
SELECT hc.*, p.name AS project_name,
       json_agg(json_build_object(
         'url', e.url, 'label', e.label, 'healthy', e.healthy,
         'statusCode', e.status_code, 'responseTimeMs', e.response_time_ms,
         'error', e.error
       )) AS endpoints
FROM health_checks hc
JOIN projects p ON p.id = hc.project_id
LEFT JOIN endpoints e ON e.health_check_id = hc.id
WHERE hc.run_id = $1
GROUP BY hc.id, p.name;

-- 3) 해당 run의 test_results + failures
SELECT tr.*, p.name AS project_name,
       json_agg(json_build_object(
         'testName', tf.test_name, 'error', tf.error_message
       ) ORDER BY tf.id) FILTER (WHERE tf.id IS NOT NULL) AS failures
FROM test_results tr
JOIN projects p ON p.id = tr.project_id
LEFT JOIN test_failures tf ON tf.test_result_id = tr.id
WHERE tr.run_id = $1
GROUP BY tr.id, p.name;

-- 4) issue_reports
SELECT ir.*, p.name AS project_name
FROM issue_reports ir
JOIN projects p ON p.id = ir.project_id
WHERE ir.run_id = $1;
```

### `GET /api/projects` — 프로젝트별 현황 (최신 run 기준)

```sql
WITH latest AS (
  SELECT id FROM runs ORDER BY started_at DESC LIMIT 1
)
SELECT p.name,
       hc.healthy, hc.checked_at,
       tr.executed, tr.passed, tr.failed, tr.skipped, tr.total,
       tr.skipped_reason
FROM projects p
JOIN latest l ON true
LEFT JOIN health_checks hc ON hc.project_id = p.id AND hc.run_id = l.id
LEFT JOIN test_results  tr ON tr.project_id = p.id AND tr.run_id = l.id;
```

### `GET /api/projects/:name` — 프로젝트 히스토리

```sql
SELECT r.run_id, r.started_at,
       hc.healthy, hc.checked_at,
       tr.executed, tr.passed, tr.failed, tr.skipped, tr.total, tr.duration_ms
FROM runs r
LEFT JOIN health_checks hc ON hc.run_id = r.id AND hc.project_id = $project_id
LEFT JOIN test_results  tr ON tr.run_id = r.id AND tr.project_id = $project_id
ORDER BY r.started_at;
```

### `GET /api/trends` — 트렌드 데이터

```sql
SELECT run_id,
       started_at::date AS date,
       CASE WHEN total_tests > 0
            THEN ROUND(total_passed::numeric / total_tests * 100, 1)
            ELSE 0 END AS pass_rate,
       CASE WHEN total_projects > 0
            THEN ROUND(healthy_projects::numeric / total_projects * 100, 1)
            ELSE 0 END AS health_rate,
       total_tests, total_passed, total_failed
FROM runs
ORDER BY started_at;
```

---

## 5. 배치 쓰기 흐름 (개발 서버 → DB)

QA 배치 스크립트가 실행 완료 후 DB에 저장하는 순서:

```
1. INSERT INTO runs (...)                        -- 실행 레코드 생성, id 반환
2. FOR EACH project:
   a. INSERT INTO health_checks (run_id, project_id, ...)
   b. INSERT INTO endpoints (health_check_id, ...)    -- 각 엔드포인트
   c. INSERT INTO test_results (run_id, project_id, ...)
   d. INSERT INTO test_failures (test_result_id, ...)  -- 실패 케이스만
   e. INSERT INTO issue_reports (run_id, project_id, ...) -- 이슈 생성/업데이트된 경우만
3. UPDATE runs SET finished_at=..., duration_ms=..., summary 컬럼들
```

트랜잭션으로 감싸서 부분 저장 방지:

```sql
BEGIN;
  -- 위 INSERT/UPDATE 수행
COMMIT;
```

---

## 6. Dashboard 연동 방법

서버의 `dashboard/server/src/routes/api.ts`에서 데이터 소스 교체:

```typescript
// 현재 (파일 기반)
import { fileDataSource } from "../services/logReader";
const ds: DataSource = fileDataSource;

// DB 전환 시
import { dbDataSource } from "../services/dbReader";
const ds: DataSource = dbDataSource;
```

`DataSource` 인터페이스(`dashboard/server/src/services/dataSource.ts`):

```typescript
interface DataSource {
  getRunList(): RunListItem[];
  getRunById(runId: string): RunLog | null;
  getLatestRun(): RunLog | null;
  getProjectsSummary(): ProjectSummary[];
  getProjectHistory(name: string): ProjectHistoryItem[];
  getTrends(): TrendData[];
}
```

이 인터페이스의 PostgreSQL 구현체를 만들면 프론트엔드 변경 없이 DB 연동 완료.

---

## 7. projects 시드 데이터

```sql
INSERT INTO projects (name) VALUES
  ('allergyinsight'),
  ('companyanalyzer'),
  ('edufit'),
  ('hopenvision'),
  ('standup'),
  ('newsletterplatform');
```

---

## 8. 데이터 보관 정책 (권장)

| 기간 | 처리 |
|------|------|
| 최근 90일 | 전체 데이터 보관 (endpoints, failures 포함) |
| 90일~1년 | runs 요약만 보관, 상세 데이터 삭제 |
| 1년 이후 | 월별 집계 테이블로 이관 후 삭제 |

```sql
-- 90일 이전 상세 데이터 정리 (runs 요약은 유지)
DELETE FROM endpoints WHERE health_check_id IN (
  SELECT hc.id FROM health_checks hc
  JOIN runs r ON r.id = hc.run_id
  WHERE r.started_at < now() - INTERVAL '90 days'
);
DELETE FROM test_failures WHERE test_result_id IN (
  SELECT tr.id FROM test_results tr
  JOIN runs r ON r.id = tr.run_id
  WHERE r.started_at < now() - INTERVAL '90 days'
);
```
