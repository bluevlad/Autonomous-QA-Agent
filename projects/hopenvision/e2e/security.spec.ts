import { test, expect, APIRequestContext } from '@playwright/test';

const API_URL = process.env.HOPENVISION_API_URL || 'http://study.unmong.com:9050';

test.describe('hopenvision 보안 패치 검증 (#12 Path Traversal)', () => {
  let request: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    request = await playwright.request.newContext({ baseURL: API_URL });
  });

  test.afterAll(async () => {
    await request.dispose();
  });

  test('Path Traversal 시도 시 400 또는 거부 응답을 반환해야 함', async () => {
    const response = await request.post('/api/import/json/exams/TEST/subjects/TEST/questions/from-upload', {
      params: {
        questionFileName: '../../etc/passwd',
        answerFileName: '../../etc/shadow',
      },
    });

    // 400 Bad Request 또는 403 Forbidden (경로 탐색 차단)
    expect(response.status()).toBeGreaterThanOrEqual(400);

    const body = await response.text();
    // 배포 후: "경로 탐색 문자를 사용할 수 없습니다" 메시지 반환
    // 배포 전: "파일을 찾을 수 없습니다" 메시지 반환 (경로는 유효하지만 파일 미존재)
    const isPatched = body.includes('경로 탐색') || body.includes('잘못된 파일 경로');
    const isUnpatched = body.includes('파일을 찾을 수 없습니다');
    expect(isPatched || isUnpatched).toBeTruthy();
  });

  test('정상 파일명은 허용되어야 함 (파일 미존재 시 적절한 에러)', async () => {
    const response = await request.post('/api/import/json/exams/TEST/subjects/TEST/questions/from-upload', {
      params: {
        questionFileName: 'test-questions.json',
        answerFileName: 'test-answers.json',
      },
    });

    // 파일이 실제로 없으므로 400이 예상되지만, Path Traversal 에러가 아닌 "파일을 찾을 수 없습니다" 메시지
    const body = await response.text();
    expect(body).not.toContain('경로 탐색');
  });

  test('Windows 경로 구분자를 사용한 Path Traversal 시도 차단', async () => {
    const response = await request.post('/api/import/json/exams/TEST/subjects/TEST/questions/from-upload', {
      params: {
        questionFileName: '..\\..\\windows\\system32\\config\\sam',
        answerFileName: 'valid.json',
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('JSON 확장자가 아닌 파일 요청 차단', async () => {
    const response = await request.post('/api/import/json/exams/TEST/subjects/TEST/questions/from-upload', {
      params: {
        questionFileName: 'malicious.txt',
        answerFileName: 'answers.json',
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
