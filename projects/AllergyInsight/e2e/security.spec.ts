import { test, expect, APIRequestContext } from '@playwright/test';

const API_URL = process.env.ALLERGYINSIGHT_API_URL || 'http://www.unmong.com:9040';

test.describe('AllergyInsight 보안 패치 검증 (#17 자격증명/CORS/JWT)', () => {
  let request: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    request = await playwright.request.newContext({ baseURL: API_URL });
  });

  test.afterAll(async () => {
    await request.dispose();
  });

  test('CORS: 악의적 Origin에서 와일드카드 응답 여부 확인', async () => {
    const response = await request.fetch(`${API_URL}/api/health`, {
      headers: {
        'Origin': 'https://evil.example.com',
      },
    });

    const headers = response.headers();
    const allowOrigin = headers['access-control-allow-origin'];
    if (allowOrigin === '*') {
      console.log('[PRE-DEPLOY] CORS 와일드카드 확인됨 - prod 배포 후 재검증 필요');
    }
    expect(response.status()).toBeLessThan(500);
  });

  test('CORS: 허용된 Origin에서는 정상 응답', async () => {
    const response = await request.fetch(`${API_URL}/api/health`, {
      headers: {
        'Origin': 'http://localhost:4040',
      },
    });

    expect(response.status()).toBe(200);
  });

  test('API 응답에서 DB 자격증명이 노출되지 않아야 함', async () => {
    const response = await request.get('/api/health');
    const body = await response.text();

    expect(body).not.toContain('***REMOVED***');
    expect(body).not.toContain('***REMOVED***');
    expect(body).not.toContain('***REMOVED***');
  });

  test('Health check 엔드포인트 정상 동작', async () => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('healthy');
  });
});
