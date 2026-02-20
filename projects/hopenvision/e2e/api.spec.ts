import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.HOPENVISION_API_URL || 'http://localhost:9050';

test.describe('API 엔드포인트 테스트', () => {
  test('GET /api/exams - 시험 목록 조회가 성공해야 함', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/exams`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('content');
    expect(data.data).toHaveProperty('totalElements');
  });

  test('GET /api/exams/{examCd} - 시험 상세 조회가 성공해야 함', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/exams/EXAM2026`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.examCd).toBe('EXAM2026');
    expect(data.data).toHaveProperty('subjects');
  });

  test('[BUG-#1] GET /api/exams/{examCd} - 존재하지 않는 시험 조회 시 404 반환해야 함', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/exams/NONEXISTENT`);

    // Fixed: GlobalExceptionHandler + EntityNotFoundException → 404
    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data.success).toBe(false);
  });

  test('[BUG-#4] POST /api/exams - 빈 객체로 등록 시 400 반환해야 함', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/exams`, {
      data: {},
    });

    // Fixed: @Valid + @NotBlank + GlobalExceptionHandler → 400
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
  });

  test('GET /api/exams/{examCd}/subjects - 과목 목록 조회가 성공해야 함', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/exams/EXAM2026/subjects`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('GET /api/exams/{examCd}/answers - 정답 목록 조회가 성공해야 함', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/exams/EXAM2026/answers`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('GET /api/exams - 검색 파라미터가 동작해야 함', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/exams`, {
      params: {
        examType: '9LEVEL',
        page: 0,
        size: 10,
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('POST /api/exams - 시험 등록이 성공해야 함', async ({ request }) => {
    const testExamCd = `API_TEST_${Date.now()}`;

    const response = await request.post(`${API_BASE_URL}/api/exams`, {
      data: {
        examCd: testExamCd,
        examNm: 'API 테스트 시험',
        examType: '9LEVEL',
        examYear: '2026',
        passScore: 60,
        isUse: 'Y',
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.examCd).toBe(testExamCd);

    // 생성된 시험 삭제 (cleanup)
    await request.delete(`${API_BASE_URL}/api/exams/${testExamCd}`);
  });

  test('DELETE /api/exams/{examCd} - 시험 삭제가 성공해야 함', async ({ request }) => {
    // 먼저 테스트용 시험 생성
    const testExamCd = `DELETE_TEST_${Date.now()}`;

    await request.post(`${API_BASE_URL}/api/exams`, {
      data: {
        examCd: testExamCd,
        examNm: '삭제 테스트 시험',
        examType: '9LEVEL',
        examYear: '2026',
        passScore: 60,
        isUse: 'Y',
      },
    });

    // 삭제 요청
    const response = await request.delete(`${API_BASE_URL}/api/exams/${testExamCd}`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);

    // 삭제 확인 — Fixed: 삭제 후 조회 시 404 반환
    const checkResponse = await request.get(`${API_BASE_URL}/api/exams/${testExamCd}`);
    expect(checkResponse.status()).toBe(404);
  });
});

test.describe('API 응답 형식 검증', () => {
  test('성공 응답 형식이 올바라야 함', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/exams`);
    const data = await response.json();

    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('data');
    expect(data.success).toBe(true);
  });

  test('페이지네이션 응답 형식이 올바라야 함', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/exams`);
    const data = await response.json();

    expect(data.data).toHaveProperty('content');
    expect(data.data).toHaveProperty('totalElements');
    expect(data.data).toHaveProperty('totalPages');
    expect(data.data).toHaveProperty('size');
    expect(data.data).toHaveProperty('number');
  });
});
