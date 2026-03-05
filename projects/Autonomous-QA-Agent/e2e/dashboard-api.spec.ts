import { test, expect } from '@playwright/test';

const API_URL = process.env.DASHBOARD_API_URL || 'http://172.30.1.72:9095';

/**
 * QA Dashboard API 헬스체크 및 기본 기능 검증
 */

test.describe('Dashboard API Health Check', () => {
  test('Health 엔드포인트가 정상 응답한다', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/health`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toMatch(/ok|up|healthy/i);
  });

  test('최근 QA 실행 목록을 조회할 수 있다', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/runs?limit=5`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('프로젝트 목록을 조회할 수 있다', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/projects`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

test.describe('Dashboard API 인증', () => {
  test('인증 없이 ingest 요청 시 401 응답', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/ingest`, {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(401);
  });
});
