/**
 * API 테스트 템플릿
 *
 * 사용법:
 * 1. 이 파일을 프로젝트의 e2e/tests/ 폴더로 복사
 * 2. 파일명을 api.spec.ts로 저장
 * 3. API 엔드포인트를 프로젝트에 맞게 수정
 */

import { test, expect, APIRequestContext } from '@playwright/test';

// ============================================
// API 설정
// ============================================

const API_BASE_URL = process.env.API_URL || 'http://localhost:8000/api';

// 테스트 데이터
const testData = {
  validItem: {
    name: '테스트 항목',
    description: '테스트 설명',
  },
  invalidItem: {
    name: '', // 빈 이름 (유효성 검사 실패 예상)
  },
};

// ============================================
// 헬퍼 함수
// ============================================

async function getAuthToken(request: APIRequestContext): Promise<string> {
  const response = await request.post(`${API_BASE_URL}/auth/login`, {
    data: {
      email: 'test@example.com',
      password: process.env.TEST_PASSWORD || 'test-only-placeholder',
    },
  });
  const data = await response.json();
  return data.token;
}

// ============================================
// API 테스트 케이스
// ============================================

test.describe('Health Check API', () => {
  test('GET /health - 서버 상태 확인', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status', 'healthy');
  });
});

test.describe('CRUD API', () => {
  let createdItemId: number;

  test('GET /items - 목록 조회', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/items`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
  });

  test('POST /items - 항목 생성', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/items`, {
      data: testData.validItem,
    });

    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.name).toBe(testData.validItem.name);

    createdItemId = data.id;
  });

  test('GET /items/:id - 개별 조회', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/items/${createdItemId}`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.id).toBe(createdItemId);
  });

  test('PUT /items/:id - 항목 수정', async ({ request }) => {
    const response = await request.put(`${API_BASE_URL}/items/${createdItemId}`, {
      data: {
        ...testData.validItem,
        name: '수정된 항목',
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.name).toBe('수정된 항목');
  });

  test('DELETE /items/:id - 항목 삭제', async ({ request }) => {
    const response = await request.delete(`${API_BASE_URL}/items/${createdItemId}`);

    expect(response.status()).toBe(204);
  });

  test('GET /items/:id - 삭제된 항목 조회 시 404', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/items/${createdItemId}`);

    expect(response.status()).toBe(404);
  });
});

test.describe('API 유효성 검사', () => {
  test('POST /items - 빈 데이터로 생성 시 400/422', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/items`, {
      data: testData.invalidItem,
    });

    expect([400, 422]).toContain(response.status());

    const data = await response.json();
    expect(data).toHaveProperty('detail');
  });

  test('POST /items - 잘못된 JSON 형식', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/items`, {
      headers: { 'Content-Type': 'application/json' },
      data: 'invalid json',
    });

    expect([400, 422]).toContain(response.status());
  });
});

test.describe('API 에러 처리', () => {
  test('존재하지 않는 엔드포인트 - 404', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/nonexistent`);

    expect(response.status()).toBe(404);
  });

  test('잘못된 HTTP 메소드 - 405', async ({ request }) => {
    const response = await request.patch(`${API_BASE_URL}/items`);

    expect(response.status()).toBe(405);
  });
});

test.describe('API 인증', () => {
  test('인증 없이 보호된 엔드포인트 접근 - 401', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/protected`);

    expect(response.status()).toBe(401);
  });

  test('유효한 토큰으로 보호된 엔드포인트 접근', async ({ request }) => {
    const token = await getAuthToken(request);

    const response = await request.get(`${API_BASE_URL}/protected`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(response.status()).toBe(200);
  });
});

test.describe('API 응답 형식', () => {
  test('Content-Type이 application/json', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/items`);

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('한글 데이터 인코딩', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/items`, {
      data: { name: '한글 테스트' },
    });

    const data = await response.json();
    expect(data.name).toBe('한글 테스트');
  });
});

test.describe('API 성능', () => {
  test('응답 시간 측정', async ({ request }) => {
    const startTime = Date.now();
    await request.get(`${API_BASE_URL}/items`);
    const responseTime = Date.now() - startTime;

    // 1초 이내 응답
    expect(responseTime).toBeLessThan(1000);
    console.log(`API 응답 시간: ${responseTime}ms`);
  });

  test('대량 데이터 조회', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/items?limit=100`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.items.length).toBeLessThanOrEqual(100);
  });
});

test.describe('API 페이지네이션', () => {
  test('페이지네이션 파라미터', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/items?page=1&size=10`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('page');
    expect(data).toHaveProperty('size');
  });
});
