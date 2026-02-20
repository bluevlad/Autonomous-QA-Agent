import { test, expect } from '@playwright/test';

const BASE_URL = process.env.HEALTHPULSE_URL || 'http://localhost:4030';

test.describe('HealthPulse API 테스트', () => {
  test.describe('Health Check API', () => {
    test('GET /api/health - 서버 상태 확인', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/health`);

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('status', 'healthy');
      expect(data).toHaveProperty('timestamp');
    });
  });

  test.describe('Subscriber Count API', () => {
    test('GET /api/subscribers/count - 구독자 수 조회', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/subscribers/count`);

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('count');
      expect(typeof data.count).toBe('number');
      expect(data.count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Admin Stats API', () => {
    test('GET /api/admin/stats - 관리자 통계 조회 (기본)', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/admin/stats`);

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('date');
      expect(data).toHaveProperty('article_count');
      expect(data).toHaveProperty('send_count');
      expect(data).toHaveProperty('success_count');
      expect(data).toHaveProperty('subscriber_count');
    });

    test('GET /api/admin/stats?date=2026-02-07 - 특정 날짜 통계 조회', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/admin/stats?date=2026-02-07`);

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.date).toBe('2026-02-07');
    });

    test('GET /api/admin/stats?date=invalid - 잘못된 날짜 형식 처리', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/admin/stats?date=invalid-date`);

      // 서버가 잘못된 날짜를 어떻게 처리하는지 확인
      // 422 에러 또는 기본값으로 처리될 수 있음
      expect([200, 422]).toContain(response.status());
    });
  });

  test.describe('Subscribe API', () => {
    test('POST /subscribe - 유효한 구독 신청', async ({ request }) => {
      const formData = new URLSearchParams();
      formData.append('email', `test_${Date.now()}@example.com`);
      formData.append('name', '테스트 사용자');
      formData.append('keywords', 'AI, 헬스케어');

      const response = await request.post(`${BASE_URL}/subscribe`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: formData.toString(),
      });

      // 성공 시 200 또는 리다이렉트 응답
      expect([200, 302]).toContain(response.status());
    });

    test('POST /subscribe - 필수 필드 누락 시 에러 반환', async ({ request }) => {
      const formData = new URLSearchParams();
      formData.append('email', '');
      formData.append('name', '');

      const response = await request.post(`${BASE_URL}/subscribe`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: formData.toString(),
      });

      expect(response.status()).toBe(422);

      const data = await response.json();
      expect(data).toHaveProperty('detail');
    });

    test('POST /subscribe - 잘못된 이메일 형식', async ({ request }) => {
      const formData = new URLSearchParams();
      formData.append('email', 'invalid-email');
      formData.append('name', '테스트');

      const response = await request.post(`${BASE_URL}/subscribe`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: formData.toString(),
      });

      // 서버가 잘못된 이메일을 어떻게 처리하는지 확인
      expect([200, 400, 422]).toContain(response.status());
    });
  });

  test.describe('Verify API', () => {
    test('POST /verify - 잘못된 인증 코드', async ({ request }) => {
      const formData = new URLSearchParams();
      formData.append('email', 'test@example.com');
      formData.append('name', '테스트');
      formData.append('keywords', '');
      formData.append('verification_id', '999999');
      formData.append('code', '000000');

      const response = await request.post(`${BASE_URL}/verify`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: formData.toString(),
      });

      // 인증 실패 시 적절한 응답 확인
      expect([200, 400, 422]).toContain(response.status());
    });
  });

  test.describe('Unsubscribe API', () => {
    test('GET /unsubscribe/{token} - 잘못된 토큰', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/unsubscribe/invalid-token-123`);

      expect(response.status()).toBe(200);

      const text = await response.text();
      expect(text).toContain('유효하지 않거나 이미 사용된 구독 해지 링크');
    });

    test('POST /unsubscribe/{token} - 잘못된 토큰으로 해지 시도', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/unsubscribe/invalid-token-123`);

      // 잘못된 토큰에 대한 응답 확인
      expect([200, 400, 404]).toContain(response.status());
    });
  });

  test.describe('Manage API', () => {
    test('GET /manage/{token} - 잘못된 토큰', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/manage/invalid-token-123`);

      expect(response.status()).toBe(404);

      const data = await response.json();
      expect(data).toHaveProperty('detail');
    });
  });

  test.describe('Admin Pages', () => {
    test('GET /admin - 관리자 대시보드 접근', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/admin`);

      expect(response.status()).toBe(200);

      const text = await response.text();
      expect(text).toContain('Daily Dashboard');
    });

    test('GET /admin/subscribers - 구독자 목록 접근', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/admin/subscribers`);

      expect(response.status()).toBe(200);

      const text = await response.text();
      expect(text).toContain('Subscriber Management');
    });

    test('GET /admin/subscribers?status=active - 활성 구독자 필터링', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/admin/subscribers?status=active`);

      expect(response.status()).toBe(200);

      const text = await response.text();
      expect(text).toContain('Subscriber Management');
    });

    test('GET /admin/send-history - 발송 이력 접근', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/admin/send-history`);

      expect(response.status()).toBe(200);

      const text = await response.text();
      expect(text).toContain('Send History');
    });

    test('GET /admin/send-history?date=2026-02-07 - 특정 날짜 발송 이력', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/admin/send-history?date=2026-02-07`);

      expect(response.status()).toBe(200);
    });

    test('GET /admin/articles - 수집 기사 접근', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/admin/articles`);

      expect(response.status()).toBe(200);

      const text = await response.text();
      expect(text).toContain('Collected Articles');
    });

    test('GET /admin/articles?date=2026-02-07 - 특정 날짜 기사 필터링', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/admin/articles?date=2026-02-07`);

      expect(response.status()).toBe(200);
    });

    test('GET /admin/articles?page=2 - 페이지네이션', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/admin/articles?page=2`);

      expect(response.status()).toBe(200);
    });
  });

  test.describe('OpenAPI Spec', () => {
    test('GET /openapi.json - OpenAPI 스펙 조회', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/openapi.json`);

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('openapi', '3.1.0');
      expect(data).toHaveProperty('info');
      expect(data.info).toHaveProperty('title', 'HealthPulse');
      expect(data).toHaveProperty('paths');
    });
  });

  test.describe('Swagger UI', () => {
    test('GET /docs - Swagger UI 접근', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/docs`);

      expect(response.status()).toBe(200);

      const text = await response.text();
      expect(text).toContain('swagger-ui');
      expect(text).toContain('HealthPulse');
    });
  });

  test.describe('에러 처리', () => {
    test('GET /api - 존재하지 않는 API 엔드포인트', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api`);

      expect(response.status()).toBe(404);

      const data = await response.json();
      expect(data).toHaveProperty('detail', 'Not Found');
    });

    test('GET /nonexistent - 존재하지 않는 페이지', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/nonexistent-page`);

      expect(response.status()).toBe(404);
    });

    test('POST / - 허용되지 않는 HTTP 메서드', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/`);

      expect(response.status()).toBe(405);
    });
  });

  test.describe('Send Now API', () => {
    test('POST /send-now - 이메일 필드 누락', async ({ request }) => {
      const formData = new URLSearchParams();
      formData.append('email', '');

      const response = await request.post(`${BASE_URL}/send-now`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: formData.toString(),
      });

      expect([200, 400, 422]).toContain(response.status());
    });
  });

  test.describe('Resend Code API', () => {
    test('POST /resend-code - 인증 코드 재전송 요청', async ({ request }) => {
      const formData = new URLSearchParams();
      formData.append('email', 'test@example.com');
      formData.append('name', '테스트');
      formData.append('keywords', '');

      const response = await request.post(`${BASE_URL}/resend-code`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: formData.toString(),
      });

      // 응답 확인
      expect([200, 400, 422]).toContain(response.status());
    });
  });

  test.describe('Complete Subscription API', () => {
    test('POST /complete-subscription - 필수 필드 누락', async ({ request }) => {
      const formData = new URLSearchParams();
      formData.append('email', '');
      formData.append('name', '');
      formData.append('subscription_type', '');

      const response = await request.post(`${BASE_URL}/complete-subscription`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: formData.toString(),
      });

      expect([200, 400, 422]).toContain(response.status());
    });
  });

  test.describe('성능 테스트', () => {
    test('API 응답 시간이 2초 이내여야 함', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get(`${BASE_URL}/api/health`);
      const endTime = Date.now();

      expect(response.status()).toBe(200);
      expect(endTime - startTime).toBeLessThan(2000);
    });

    test('메인 페이지 응답 시간이 3초 이내여야 함', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get(BASE_URL);
      const endTime = Date.now();

      expect(response.status()).toBe(200);
      expect(endTime - startTime).toBeLessThan(3000);
    });

    test('관리자 페이지 응답 시간이 3초 이내여야 함', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get(`${BASE_URL}/admin`);
      const endTime = Date.now();

      expect(response.status()).toBe(200);
      expect(endTime - startTime).toBeLessThan(3000);
    });
  });
});
