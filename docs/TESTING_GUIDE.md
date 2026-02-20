# 테스팅 가이드

Autonomous QA Agent를 사용한 테스트 가이드입니다.

## 테스트 유형

### 1. E2E (End-to-End) 테스트

사용자 관점에서 전체 기능을 테스트합니다.

```typescript
test('사용자가 시험을 등록할 수 있어야 함', async ({ page }) => {
  await page.goto('/exam/new');
  await page.fill('[name="examCd"]', 'TEST001');
  await page.fill('[name="examNm"]', '테스트 시험');
  await page.click('button[type="submit"]');
  await expect(page.getByText('시험이 등록되었습니다')).toBeVisible();
});
```

### 2. API 테스트

백엔드 API 엔드포인트를 테스트합니다.

```typescript
test('GET /api/exams - 시험 목록 조회', async ({ request }) => {
  const response = await request.get('/api/exams');
  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  expect(data.success).toBe(true);
});
```

### 3. 버그 검증 테스트

발견된 버그를 재현하고 수정 여부를 확인합니다.

```typescript
test('[BUG-#1] API 에러 시 적절한 상태 코드 반환', async ({ request }) => {
  const response = await request.get('/api/exams/NONEXISTENT');

  // 현재 버그: 500 반환
  // 수정 후: 404 반환
  expect(response.status()).toBe(404);
});
```

## 테스트 실행

### 전체 테스트

```bash
npm run test:all
```

### 프로젝트별 테스트

```bash
npm run test:hopenvision
```

### UI 모드 (디버깅)

```bash
npm run test:ui
```

### 특정 파일 테스트

```bash
npx playwright test projects/hopenvision/e2e/exam-list.spec.ts
```

### 헤드리스 모드 해제

```bash
npm run test:headed
```

## 테스트 작성 가이드

### 테스트 구조

```typescript
import { test, expect } from '@playwright/test';

test.describe('기능 영역', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전 실행
    await page.goto('/');
  });

  test('테스트 케이스 1', async ({ page }) => {
    // 테스트 로직
  });

  test('테스트 케이스 2', async ({ page }) => {
    // 테스트 로직
  });
});
```

### 네이밍 컨벤션

- 파일명: `[기능].spec.ts` (예: `exam-list.spec.ts`)
- describe: 기능 영역 (예: `시험 목록 페이지`)
- test: 동작 설명 (예: `시험 등록 버튼 클릭 시 등록 페이지로 이동해야 함`)

### 버그 테스트 태그

```typescript
// 버그 검증 테스트
test('[BUG] passScore가 null일 때 "null점"이 표시되지 않아야 함', ...);

// GitHub Issue 연결
test('[BUG-#123] 이슈 제목', ...);
```

## 테스트 리포트

### HTML 리포트 보기

```bash
npm run test:report
```

### 리포트 위치

- HTML: `playwright-report/index.html`
- JSON: `test-results/results.json`

## 공통 유틸리티 사용

```typescript
import { waitForPageLoad, fillForm, expectMessage } from '../../shared/utils/test-helpers';

test('폼 제출', async ({ page }) => {
  await page.goto('/form');
  await fillForm(page, {
    '이름': '홍길동',
    '이메일': 'test@example.com',
  });
  await page.click('button[type="submit"]');
  await expectMessage(page, '저장되었습니다', 'success');
});
```

## 환경 변수

```bash
# .env 파일
HOPENVISION_URL=http://localhost:4060
HOPENVISION_API_URL=http://localhost:9050
```

## 문제 해결

### 테스트 실패 시

1. 스크린샷 확인: `test-results/` 폴더
2. 트레이스 확인: UI 모드에서 실행
3. 네트워크 요청 확인: 개발자 도구

### 타임아웃 발생 시

```typescript
// 타임아웃 증가
test('느린 작업', async ({ page }) => {
  test.setTimeout(60000); // 60초
  // ...
});
```

### 요소를 찾지 못할 때

```typescript
// 요소 대기
await page.waitForSelector('.target-element');

// 또는 locator 사용
await expect(page.locator('.target-element')).toBeVisible({ timeout: 10000 });
```
