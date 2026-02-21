import { test, expect } from '@playwright/test';

/**
 * StandUp API 보안 및 안정성 테스트
 */

const API_URL = process.env.STANDUP_API_URL || 'http://localhost:9060';

test.describe('StandUp API 입력 검증', () => {
  test('work-items limit 최대값 초과 시 422', async ({ request }) => {
    const response = await request.get(
      `${API_URL}/api/v1/work-items?limit=999`
    );
    // FastAPI Query(le=200)으로 제한되므로 422 예상
    expect(response.status()).toBe(422);
  });

  test('work-items offset 음수 시 422', async ({ request }) => {
    const response = await request.get(
      `${API_URL}/api/v1/work-items?offset=-1`
    );
    expect(response.status()).toBe(422);
  });

  test('agent-logs limit 최대값 초과 시 422', async ({ request }) => {
    const response = await request.get(
      `${API_URL}/api/v1/agent-logs?limit=999`
    );
    expect(response.status()).toBe(422);
  });

  test('reports 잘못된 report_type 시 422', async ({ request }) => {
    const response = await request.get(
      `${API_URL}/api/v1/reports?report_type=invalid`
    );
    expect(response.status()).toBe(422);
  });
});

test.describe('StandUp API 응답 구조 검증', () => {
  test('work-items 응답 필드 구조 확인', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/work-items?limit=1`);
    const body = await response.json();

    if (body.length > 0) {
      const item = body[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('github_repo');
      expect(item).toHaveProperty('issue_number');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('category');
      expect(item).toHaveProperty('status');
    }
  });

  test('reports 응답 필드 구조 확인', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/reports?limit=1`);
    const body = await response.json();

    if (body.length > 0) {
      const report = body[0];
      expect(report).toHaveProperty('id');
      expect(report).toHaveProperty('report_type');
      expect(report).toHaveProperty('status');
      expect(report).toHaveProperty('title');
    }
  });

  test('agent-logs 응답 필드 구조 확인', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/agent-logs?limit=1`);
    const body = await response.json();

    if (body.length > 0) {
      const log = body[0];
      expect(log).toHaveProperty('id');
      expect(log).toHaveProperty('agent_name');
      expect(log).toHaveProperty('action');
      expect(log).toHaveProperty('status');
      expect(log).toHaveProperty('executed_at');
    }
  });
});

test.describe('StandUp API 보안 헤더', () => {
  test('응답에 적절한 Content-Type 헤더', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/health`);
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('존재하지 않는 엔드포인트 접근 시 404', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/nonexistent`);
    expect(response.status()).toBe(404);
  });

  test('허용되지 않는 HTTP 메서드 처리', async ({ request }) => {
    const response = await request.delete(`${API_URL}/api/v1/health`);
    expect([405, 404]).toContain(response.status());
  });
});
