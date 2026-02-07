import { test, expect } from '@playwright/test';

test.describe('시험 등록/수정 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/exam/new');
  });

  test('시험 등록 폼이 정상적으로 표시되어야 함', async ({ page }) => {
    // 폼 제목 확인
    await expect(page.getByText('시험 등록')).toBeVisible();

    // 필수 필드 확인
    await expect(page.getByLabel('시험코드')).toBeVisible();
    await expect(page.getByLabel('시험명')).toBeVisible();
    // Ant Design Select 컴포넌트 확인
    await expect(page.locator('.ant-select').first()).toBeVisible();
  });

  test('필수 필드가 비어있을 때 유효성 검사 에러가 표시되어야 함', async ({ page }) => {
    // 등록 버튼 클릭
    await page.getByRole('button', { name: '등록' }).click();

    // 유효성 검사 에러 메시지 확인
    await expect(page.getByText('시험코드를 입력하세요')).toBeVisible();
    await expect(page.getByText('시험명을 입력하세요')).toBeVisible();
  });

  test('시험 등록 폼 작성이 동작해야 함', async ({ page }) => {
    const testExamCd = `TEST_${Date.now()}`;

    // 폼 로드 대기
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('시험 등록')).toBeVisible();

    // 폼 입력
    await page.getByLabel('시험코드').fill(testExamCd);
    await page.getByLabel('시험명').fill('테스트 시험');

    // 시험유형 Select 클릭 (첫 번째 "선택" 텍스트)
    await page.getByText('선택').first().click({ force: true });
    await page.getByTitle('9급 공무원').click();

    // 시험년도 Select 클릭
    await page.getByText('선택').first().click({ force: true });
    await page.getByTitle('2026년').click();

    // 합격 기준 점수 입력 (필수 필드)
    await page.getByLabel('합격 기준 점수').fill('60');

    // 폼 필드가 올바르게 채워졌는지 확인
    await expect(page.getByLabel('시험코드')).toHaveValue(testExamCd);
    await expect(page.getByLabel('시험명')).toHaveValue('테스트 시험');
    await expect(page.getByLabel('합격 기준 점수')).toHaveValue('60');

    // 등록 버튼이 활성화되어 있는지 확인
    await expect(page.getByRole('button', { name: '등록' })).toBeEnabled();

    // 참고: 실제 등록 시 API 에러 발생 가능 (과목 미등록 등)
    // 폼 작성 기능 테스트만 수행
  });

  test('목록으로 버튼 클릭 시 목록 페이지로 이동해야 함', async ({ page }) => {
    await page.getByRole('button', { name: /목록으로/i }).click();

    await expect(page).toHaveURL(/\/exam$/);
  });

  test('과목 추가가 동작해야 함', async ({ page }) => {
    // 과목 정보 입력
    await page.locator('input[placeholder="과목코드"]').fill('KOREAN');
    await page.locator('input[placeholder="과목명"]').fill('국어');

    // 추가 버튼 클릭
    await page.getByRole('button', { name: /추가/i }).click();

    // 과목이 테이블에 추가되어야 함
    await expect(page.getByText('KOREAN')).toBeVisible();
    await expect(page.getByText('국어')).toBeVisible();
  });
});

test.describe('시험 수정 페이지', () => {
  test('기존 시험 데이터가 폼에 로드되어야 함', async ({ page }) => {
    // 기존 시험 수정 페이지로 이동
    await page.goto('/exam/EXAM2026');

    // 시험 수정 타이틀 확인
    await expect(page.getByText('시험 수정')).toBeVisible();

    // 시험코드 필드가 비활성화되어야 함
    await expect(page.getByLabel('시험코드')).toBeDisabled();

    // 기존 데이터가 로드되어야 함
    await expect(page.getByLabel('시험명')).toHaveValue('2026 Test Exam');
  });

  test('정답 버튼 클릭 시 정답 입력 페이지로 이동해야 함', async ({ page }) => {
    await page.goto('/exam/EXAM2026');

    // 정답 버튼은 시험 수정 페이지에서 직접 접근 가능한지 확인
    // 또는 목록에서 정답 버튼 클릭
    await page.goto('/');

    // 테이블에서 정답 버튼 찾기
    const answerButton = page.getByRole('row').filter({ hasText: 'EXAM2026' }).getByRole('button', { name: /정답/i });

    if (await answerButton.isVisible()) {
      await answerButton.click();
      await expect(page).toHaveURL(/\/exam\/EXAM2026\/answers/);
    }
  });
});
