import { test, expect } from '@playwright/test';

const API_BASE = process.env.NEWSLETTERPLATFORM_URL || 'http://www.unmong.com:4055';

/**
 * NewsLetterPlatform - API 테스트
 */

test.describe('NewsLetterPlatform API 엔드포인트', () => {
  test('API 서버가 응답한다', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/health`);
    expect(response.status()).toBeLessThan(500);
  });

  test('테넌트 목록 API가 응답한다', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/tenants`);
    expect(response.status()).toBeLessThan(500);
  });

  test('뉴스레터 목록 API가 응답한다', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/newsletters`);
    expect(response.status()).toBeLessThan(500);
  });

  test('발송 이력 API가 응답한다', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/send-history`);
    expect(response.status()).toBeLessThan(500);
  });
});
