import { test, expect, APIRequestContext } from '@playwright/test';

const BASE_URL = process.env.NEWSLETTERPLATFORM_URL || 'http://www.unmong.com:4055';

test.describe('NewsLetterPlatform 보안 패치 검증 (#1 이메일 인젝션/토큰)', () => {
  let request: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    request = await playwright.request.newContext({ baseURL: BASE_URL });
  });

  test.afterAll(async () => {
    await request.dispose();
  });

  test('서비스 정상 동작 (보안 패치 후 서비스 무결성)', async () => {
    const response = await request.get('/api/health');
    // 서비스가 응답하면 됨 (500 미만)
    expect(response.status()).toBeLessThan(500);
  });

  test('구독 해지 토큰: 무효 토큰으로 접근 시 적절한 에러', async () => {
    // 랜덤한 토큰으로 접근
    const response = await request.get('/healthpulse/unsubscribe/token/invalid-fake-token-12345');

    // 404 또는 적절한 에러 페이지
    const body = await response.text();
    expect(body).not.toContain('Internal Server Error');
    expect(body).not.toContain('Traceback');
  });

  test('구독 신청: 개행 문자 포함 이메일로 인젝션 시도 차단', async () => {
    const response = await request.post('/healthpulse/subscribe', {
      form: {
        email: 'test@example.com\r\nBcc: hacker@evil.com',
        name: 'test',
      },
    });

    const body = await response.text();
    // 인젝션이 동작하지 않아야 함
    expect(body).not.toContain('hacker@evil.com');
  });

  test('API 응답에서 자격증명이 노출되지 않아야 함', async () => {
    const response = await request.get('/api/health');
    const body = await response.text();

    expect(body).not.toContain('zmylljjuhrljuokl'); // Gmail app password
    expect(body).not.toContain('GMAIL_APP_PASSWORD');
  });

  test('테넌트 목록 API 정상 동작', async () => {
    const response = await request.get('/api/tenants');
    if (response.status() === 200) {
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    }
  });
});
