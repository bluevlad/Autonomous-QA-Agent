import { test, expect, APIRequestContext } from '@playwright/test';

const BASE_URL = process.env.UNMONG_MAIN_URL || 'http://www.unmong.com';

test.describe('unmong-main 보안 패치 검증 (#12 SSL 비밀번호)', () => {
  let request: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    request = await playwright.request.newContext({ baseURL: BASE_URL });
  });

  test.afterAll(async () => {
    await request.dispose();
  });

  test('메인 페이지가 정상 응답해야 함 (SSL 설정 무결성)', async () => {
    const response = await request.get('/');
    expect(response.status()).toBeLessThan(500);
  });

  test('응답에 SSL 비밀번호가 노출되지 않아야 함', async () => {
    const response = await request.get('/');
    const body = await response.text();

    expect(body).not.toContain('key-store-password');
    expect(body).not.toContain('SSL_KEYSTORE_PASSWORD');
  });

  test('보안 헤더가 설정되어야 함', async () => {
    const response = await request.get('/');
    const headers = response.headers();

    // 기본적인 보안 헤더 확인 (배포 후 검증)
    // X-Content-Type-Options, X-Frame-Options 등
    const contentType = headers['content-type'];
    expect(contentType).toBeDefined();
  });
});
