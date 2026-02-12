import { test, expect } from '@playwright/test';

const API_BASE = process.env.ACADEMYINSIGHT_API_URL || 'http://study.unmong.com:8082';

/**
 * AcademyInsight - API 테스트
 */

test.describe('AcademyInsight API 엔드포인트', () => {
  test('API 서버가 응답한다', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/health`);
    expect(response.status()).toBeLessThan(500);
  });

  test('대시보드 API가 정상 응답한다', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/dashboard`);
    expect(response.status()).toBeLessThan(500);
  });

  test('크롤링 상태 API가 응답한다', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/crawl/status`);
    expect(response.status()).toBeLessThan(500);
  });

  test('강사 목록 API가 응답한다', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/teachers`);
    expect(response.status()).toBeLessThan(500);
  });

  test('학원 목록 API가 응답한다', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/academies`);
    expect(response.status()).toBeLessThan(500);
  });
});
