import { test, expect } from '@playwright/test';

/**
 * StandUp E2E 테스트
 * API 서버: http://localhost:9060/
 * Swagger UI: http://localhost:9060/docs
 */

const API_URL = process.env.STANDUP_API_URL || 'http://localhost:9060';

test.describe('StandUp 헬스체크', () => {
  test('헬스체크 API 응답 확인', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/health`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('StandUp');
    expect(body).toHaveProperty('database');
    expect(body).toHaveProperty('scheduler');
  });

  test('헬스체크 DB 통계 포함 확인', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/health`);
    const body = await response.json();

    expect(body.database).toHaveProperty('work_items');
    expect(body.database).toHaveProperty('reports');
    expect(typeof body.database.work_items).toBe('number');
    expect(typeof body.database.reports).toBe('number');
  });

  test('스케줄러 상태 확인', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/health`);
    const body = await response.json();

    expect(body.scheduler).toHaveProperty('running');
    expect(body.scheduler).toHaveProperty('jobs');
    expect(Array.isArray(body.scheduler.jobs)).toBe(true);
  });
});

test.describe('StandUp 통계 API', () => {
  test('업무 통계 조회', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/stats`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('work_items');
    expect(body).toHaveProperty('reports');
    expect(body.work_items).toHaveProperty('planned');
    expect(body.work_items).toHaveProperty('required');
    expect(body.work_items).toHaveProperty('in_progress');
    expect(body.work_items).toHaveProperty('total');
  });

  test('보고서 통계 조회', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/stats`);
    const body = await response.json();

    expect(body.reports).toHaveProperty('sent');
    expect(body.reports).toHaveProperty('failed');
    expect(typeof body.reports.sent).toBe('number');
    expect(typeof body.reports.failed).toBe('number');
  });
});

test.describe('StandUp 업무 항목 API', () => {
  test('업무 항목 목록 조회', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/work-items`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('업무 항목 카테고리 필터 동작', async ({ request }) => {
    const categories = ['planned', 'required', 'in_progress'];

    for (const category of categories) {
      const response = await request.get(
        `${API_URL}/api/v1/work-items?category=${category}`
      );
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    }
  });

  test('업무 항목 페이지네이션 동작', async ({ request }) => {
    const response = await request.get(
      `${API_URL}/api/v1/work-items?limit=5&offset=0`
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeLessThanOrEqual(5);
  });
});

test.describe('StandUp 보고서 API', () => {
  test('보고서 목록 조회', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/reports`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('보고서 타입별 필터 동작', async ({ request }) => {
    const types = ['daily', 'weekly', 'monthly'];

    for (const type of types) {
      const response = await request.get(
        `${API_URL}/api/v1/reports?report_type=${type}`
      );
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    }
  });

  test('존재하지 않는 보고서 조회 시 404', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/reports/999999`);
    expect(response.status()).toBe(404);
  });
});

test.describe('StandUp Agent 로그 API', () => {
  test('Agent 실행 이력 조회', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/agent-logs`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('Agent 이름별 필터 동작', async ({ request }) => {
    const agents = ['qa_agent', 'tobe_agent', 'report_agent'];

    for (const agent of agents) {
      const response = await request.get(
        `${API_URL}/api/v1/agent-logs?agent_name=${agent}`
      );
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    }
  });

  test('Agent 로그 limit 파라미터 동작', async ({ request }) => {
    const response = await request.get(
      `${API_URL}/api/v1/agent-logs?limit=5`
    );
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeLessThanOrEqual(5);
  });
});

test.describe('StandUp API 문서', () => {
  test('Swagger UI 접근 가능 확인', async ({ request }) => {
    const response = await request.get(`${API_URL}/docs`);
    expect(response.status()).toBe(200);
  });

  test('OpenAPI JSON 스키마 접근 가능 확인', async ({ request }) => {
    const response = await request.get(`${API_URL}/openapi.json`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('openapi');
    expect(body).toHaveProperty('paths');
  });
});
