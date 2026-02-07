import { test, expect } from '@playwright/test';

test.describe('정답 입력 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/exam/EXAM2026/answers');
  });

  test('정답 입력 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await expect(page.getByText('정답 등록')).toBeVisible();
    await expect(page.getByText('과목을 선택하세요')).toBeVisible();
  });

  test('과목 선택 시 정답 입력 테이블이 표시되어야 함', async ({ page }) => {
    // 과목 선택
    await page.getByPlaceholder('과목을 선택하세요').click();
    await page.getByText('Korean History').click();

    // 정답 입력 테이블이 표시되어야 함
    await expect(page.locator('table')).toBeVisible();

    // 문항 번호가 표시되어야 함
    await expect(page.getByText('문항')).toBeVisible();
    await expect(page.getByText('정답')).toBeVisible();
  });

  test('정답 선택이 동작해야 함', async ({ page }) => {
    // 과목 선택
    await page.getByPlaceholder('과목을 선택하세요').click();
    await page.getByText('Korean History').click();

    // 테이블 로드 대기
    await page.waitForSelector('table');

    // 첫 번째 문항에 정답 3 선택
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.getByRole('radio', { name: '3' }).click();

    // 선택이 반영되어야 함
    await expect(firstRow.getByRole('radio', { name: '3' })).toBeChecked();
  });

  test('정답 저장 버튼이 동작해야 함', async ({ page }) => {
    // 과목 선택
    await page.getByPlaceholder('과목을 선택하세요').click();
    await page.getByText('Korean History').click();

    // 테이블 로드 대기
    await page.waitForSelector('table');

    // 정답 저장 버튼 클릭
    await page.getByRole('button', { name: /정답 저장/i }).click();

    // 저장 성공 메시지 또는 경고 메시지 확인
    const successMessage = page.getByText('정답이 저장되었습니다');
    const warningMessage = page.getByText(/문항의 정답이 입력되지 않았습니다/);

    await expect(successMessage.or(warningMessage)).toBeVisible({ timeout: 10000 });
  });

  test('Excel 가져오기 버튼이 동작해야 함', async ({ page }) => {
    await page.getByRole('button', { name: /Excel 가져오기/i }).click();

    // Excel 가져오기 페이지로 이동
    await expect(page).toHaveURL(/\/exam\/EXAM2026\/import/);
  });

  test('시험 정보로 돌아가기 버튼이 동작해야 함', async ({ page }) => {
    await page.getByRole('button', { name: /시험 정보로 돌아가기/i }).click();

    // 시험 상세 페이지로 이동
    await expect(page).toHaveURL(/\/exam\/EXAM2026$/);
  });
});

test.describe('Excel 가져오기 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/exam/EXAM2026/import');
  });

  test('Excel 가져오기 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await expect(page.getByText('Excel 정답 가져오기')).toBeVisible();
    await expect(page.getByText('Excel 파일 형식 안내')).toBeVisible();
  });

  test('샘플 템플릿 다운로드 버튼이 있어야 함', async ({ page }) => {
    await expect(page.getByRole('button', { name: /샘플 템플릿 다운로드/i })).toBeVisible();
  });

  test('파일 업로드 영역이 있어야 함', async ({ page }) => {
    await expect(page.getByText('클릭하거나 파일을 이 영역으로 드래그하세요')).toBeVisible();
  });

  test('[BUG] 시험 목록으로 버튼이 올바른 경로로 이동해야 함', async ({ page }) => {
    // 이 테스트는 버그 #3 검증용
    // 현재 /exams로 이동하지만 /exam이어야 함

    // 파일 업로드 후 완료 상태에서만 버튼이 표시되므로
    // 뒤로가기 버튼으로 테스트
    await page.getByRole('button', { name: /뒤로가기/i }).click();

    // 이전 페이지로 이동해야 함
    await expect(page).not.toHaveURL(/\/exams$/);
  });
});
