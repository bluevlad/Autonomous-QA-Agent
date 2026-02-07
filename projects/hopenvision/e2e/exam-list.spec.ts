import { test, expect } from '@playwright/test';

test.describe('시험 목록 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('시험 목록 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/hopenvision/i);

    // 시험 목록 테이블이 표시되어야 함
    await expect(page.getByText('시험 목록')).toBeVisible();

    // 시험 등록 버튼이 있어야 함
    await expect(page.getByRole('button', { name: /시험 등록/i })).toBeVisible();
  });

  test('검색 필터가 동작해야 함', async ({ page }) => {
    // 페이지 완전 로드 대기
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('table', { timeout: 10000 });

    // 시험유형 Select 클릭 (placeholder 텍스트로 찾기)
    await page.getByText('시험유형').first().click({ force: true });

    // 드롭다운에서 옵션 선택 (Ant Design option)
    await page.getByTitle('9급 공무원').click();

    // 검색 버튼 클릭
    await page.getByRole('button', { name: /검색/i }).click();

    // 페이지가 다시 로드되어야 함 (테이블이 여전히 존재)
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('초기화 버튼이 필터를 리셋해야 함', async ({ page }) => {
    // 검색어 입력
    await page.getByPlaceholder('시험명 또는 시험코드 검색').fill('테스트');

    // 초기화 버튼 클릭
    await page.getByRole('button', { name: /초기화/i }).click();

    // 검색어가 비워져야 함
    await expect(page.getByPlaceholder('시험명 또는 시험코드 검색')).toHaveValue('');
  });

  test('시험 등록 버튼 클릭 시 등록 페이지로 이동해야 함', async ({ page }) => {
    await page.getByRole('button', { name: /시험 등록/i }).click();

    // URL이 /exam/new로 변경되어야 함
    await expect(page).toHaveURL(/\/exam\/new/);

    // 시험 등록 폼이 표시되어야 함
    await expect(page.getByText('시험 등록')).toBeVisible();
  });

  test('테이블에 필수 컬럼이 표시되어야 함', async ({ page }) => {
    const expectedColumns = [
      '시험코드',
      '시험명',
      '시험유형',
      '시험일',
      '과목수',
      '응시자수',
      '합격기준',
      '사용여부',
      '등록일',
      '관리',
    ];

    for (const column of expectedColumns) {
      await expect(page.getByRole('columnheader', { name: column })).toBeVisible();
    }
  });

  test.fail('[BUG] passScore가 null일 때 "null점"이 표시되지 않아야 함', async ({ page }) => {
    // 이 테스트는 Issue #2 버그 검증용
    // 버그가 수정되면 test.fail() 제거 필요

    // 테이블이 로드될 때까지 대기
    await page.waitForSelector('table');

    // "null점" 텍스트가 없어야 함
    const nullText = page.getByText('null점');
    const count = await nullText.count();

    // 현재 버그: count가 1 (null점이 표시됨)
    // 수정 후: count가 0이어야 함
    expect(count).toBe(0);
  });
});
