-- QA Dashboard - PostgreSQL Schema
-- 사용법: psql -U postgres -f schema.sql

-- 1. DB + 서비스 계정 생성
CREATE DATABASE qa_dashboard;
CREATE USER qa_dashboard_svc WITH PASSWORD 'qa_dashboard_pass';
GRANT ALL PRIVILEGES ON DATABASE qa_dashboard TO qa_dashboard_svc;

\c qa_dashboard

-- 스키마 권한
GRANT ALL ON SCHEMA public TO qa_dashboard_svc;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO qa_dashboard_svc;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO qa_dashboard_svc;

-- 2. 테이블 생성

-- 실행 이력 (QA Agent 1회 실행 = 1 row)
CREATE TABLE qa_runs (
    id            BIGSERIAL PRIMARY KEY,
    run_id        VARCHAR(32) NOT NULL UNIQUE,
    started_at    TIMESTAMPTZ NOT NULL,
    finished_at   TIMESTAMPTZ NOT NULL,
    duration_ms   INTEGER NOT NULL,
    total_projects    INTEGER NOT NULL DEFAULT 0,
    healthy_projects  INTEGER NOT NULL DEFAULT 0,
    tested_projects   INTEGER NOT NULL DEFAULT 0,
    total_tests       INTEGER NOT NULL DEFAULT 0,
    total_passed      INTEGER NOT NULL DEFAULT 0,
    total_failed      INTEGER NOT NULL DEFAULT 0,
    total_skipped     INTEGER NOT NULL DEFAULT 0,
    raw_json      JSONB,
    search_vector TSVECTOR,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Health Check 결과 (프로젝트당 1 row)
CREATE TABLE qa_health_results (
    id            BIGSERIAL PRIMARY KEY,
    run_id        BIGINT NOT NULL REFERENCES qa_runs(id) ON DELETE CASCADE,
    project_name  VARCHAR(64) NOT NULL,
    healthy       BOOLEAN NOT NULL,
    checked_at    TIMESTAMPTZ NOT NULL,
    endpoints     JSONB NOT NULL DEFAULT '[]',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 테스트 결과 (프로젝트당 1 row)
CREATE TABLE qa_test_results (
    id              BIGSERIAL PRIMARY KEY,
    run_id          BIGINT NOT NULL REFERENCES qa_runs(id) ON DELETE CASCADE,
    project_name    VARCHAR(64) NOT NULL,
    executed        BOOLEAN NOT NULL DEFAULT FALSE,
    skipped_reason  TEXT,
    passed          INTEGER NOT NULL DEFAULT 0,
    failed          INTEGER NOT NULL DEFAULT 0,
    skipped         INTEGER NOT NULL DEFAULT 0,
    total           INTEGER NOT NULL DEFAULT 0,
    exit_code       INTEGER NOT NULL DEFAULT 0,
    duration_ms     INTEGER NOT NULL DEFAULT 0,
    failures        TEXT[] DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 실패 상세 (실패 테스트당 1 row)
CREATE TABLE qa_failure_details (
    id              BIGSERIAL PRIMARY KEY,
    test_result_id  BIGINT NOT NULL REFERENCES qa_test_results(id) ON DELETE CASCADE,
    test_name       TEXT NOT NULL,
    suite_name      TEXT,
    file_path       TEXT,
    error_message   TEXT,
    category        VARCHAR(32),
    search_vector   TSVECTOR,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 개선 제안
CREATE TABLE qa_suggestions (
    id              BIGSERIAL PRIMARY KEY,
    run_id          BIGINT NOT NULL REFERENCES qa_runs(id) ON DELETE CASCADE,
    rule_id         VARCHAR(64) NOT NULL,
    severity        VARCHAR(16) NOT NULL DEFAULT 'info',
    title           TEXT NOT NULL,
    description     TEXT,
    project_name    VARCHAR(64),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. 인덱스

CREATE INDEX idx_qa_runs_started_at ON qa_runs (started_at DESC);
CREATE INDEX idx_qa_runs_search ON qa_runs USING GIN (search_vector);

CREATE INDEX idx_qa_health_results_run_id ON qa_health_results (run_id);
CREATE INDEX idx_qa_health_results_project ON qa_health_results (project_name);

CREATE INDEX idx_qa_test_results_run_id ON qa_test_results (run_id);
CREATE INDEX idx_qa_test_results_project ON qa_test_results (project_name);

CREATE INDEX idx_qa_failure_details_test_result ON qa_failure_details (test_result_id);
CREATE INDEX idx_qa_failure_details_search ON qa_failure_details USING GIN (search_vector);

CREATE INDEX idx_qa_suggestions_run_id ON qa_suggestions (run_id);

-- 4. tsvector 자동 업데이트 트리거

CREATE OR REPLACE FUNCTION qa_runs_search_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('simple', COALESCE(NEW.run_id, '')), 'A');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_qa_runs_search
    BEFORE INSERT OR UPDATE ON qa_runs
    FOR EACH ROW EXECUTE FUNCTION qa_runs_search_trigger();

CREATE OR REPLACE FUNCTION qa_failure_details_search_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('simple', COALESCE(NEW.test_name, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.error_message, '')), 'B') ||
        setweight(to_tsvector('simple', COALESCE(NEW.suite_name, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_qa_failure_details_search
    BEFORE INSERT OR UPDATE ON qa_failure_details
    FOR EACH ROW EXECUTE FUNCTION qa_failure_details_search_trigger();
