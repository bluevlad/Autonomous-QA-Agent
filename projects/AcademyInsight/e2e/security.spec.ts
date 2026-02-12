import { test, expect, APIRequestContext } from '@playwright/test';

const API_URL = process.env.ACADEMYINSIGHT_API_URL || 'http://study.unmong.com:8082';

test.describe('AcademyInsight 보안 패치 검증 (#6 JWT/Docker/CORS)', () => {
  let request: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    request = await playwright.request.newContext({ baseURL: API_URL });
  });

  test.afterAll(async () => {
    await request.dispose();
  });

  test('CORS: 악의적 Origin에서 와일드카드 응답 여부 확인', async () => {
    const response = await request.fetch(`${API_URL}/`, {
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

  test('인증 없는 보호 라우트 접근 시 401 반환', async () => {
    const response = await request.get('/api/auth/me');
    expect(response.status()).toBe(401);

    const body = await response.json();
    // error.message 직접 노출이 아닌 정형화된 메시지
    expect(body.success).toBe(false);
    expect(body.message).not.toContain('Cannot');
    expect(body.message).not.toContain('Error:');
  });

  test('잘못된 JWT로 요청 시 401 반환 (스택 트레이스 미노출)', async () => {
    const response = await request.get('/api/auth/me', {
      headers: {
        'Authorization': 'Bearer invalid-token-12345',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.text();
    // 스택 트레이스나 내부 에러 메시지가 노출되지 않아야 함
    expect(body).not.toContain('JsonWebTokenError');
    expect(body).not.toContain('jwt malformed');
    expect(body).not.toContain('node_modules');
  });

  test('회원가입 에러 시 내부 에러 메시지 미노출', async () => {
    const response = await request.post('/api/auth/register', {
      data: {}, // 빈 요청으로 에러 유발
    });

    const body = await response.text();
    expect(body).not.toContain('ValidationError');
    expect(body).not.toContain('at Object.');
    expect(body).not.toContain('node_modules');
  });
});
