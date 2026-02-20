/**
 * E2E 테스트 템플릿
 *
 * 사용법:
 * 1. 이 파일을 프로젝트의 e2e/tests/ 폴더로 복사
 * 2. 파일명을 적절하게 변경 (예: login.spec.ts, dashboard.spec.ts)
 * 3. 테스트 케이스를 프로젝트에 맞게 수정
 */

import { test, expect, Page } from '@playwright/test';

// ============================================
// 테스트 설정
// ============================================

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// 테스트 데이터
const testData = {
  validEmail: 'test@example.com',
  validPassword: process.env.TEST_PASSWORD || 'test-only-placeholder',
  invalidEmail: 'invalid-email',
};

// ============================================
// 헬퍼 함수
// ============================================

async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
}

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('이메일').fill(email);
  await page.getByLabel('비밀번호').fill(password);
  await page.getByRole('button', { name: '로그인' }).click();
}

// ============================================
// 테스트 케이스
// ============================================

test.describe('페이지 기본 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test('메인 페이지가 로드되어야 함', async ({ page }) => {
    // 타이틀 확인
    await expect(page).toHaveTitle(/프로젝트명/);

    // 주요 요소 확인
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('네비게이션이 동작해야 함', async ({ page }) => {
    // 메뉴 클릭
    await page.getByRole('link', { name: '메뉴1' }).click();

    // URL 변경 확인
    await expect(page).toHaveURL(/\/menu1/);
  });
});

test.describe('폼 테스트', () => {
  test('필수 필드 유효성 검사', async ({ page }) => {
    await page.goto('/form');

    // 빈 폼 제출
    await page.getByRole('button', { name: '제출' }).click();

    // 에러 메시지 확인
    await expect(page.getByText('필수 입력 항목입니다')).toBeVisible();
  });

  test('유효한 데이터로 폼 제출', async ({ page }) => {
    await page.goto('/form');

    // 폼 입력
    await page.getByLabel('이름').fill('홍길동');
    await page.getByLabel('이메일').fill(testData.validEmail);

    // 제출
    await page.getByRole('button', { name: '제출' }).click();

    // 성공 메시지 확인
    await expect(page.getByText('저장되었습니다')).toBeVisible();
  });
});

test.describe('반응형 디자인 테스트', () => {
  test('모바일 뷰포트', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 모바일 메뉴 버튼 확인
    await expect(page.getByRole('button', { name: '메뉴' })).toBeVisible();
  });

  test('태블릿 뷰포트', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('main')).toBeVisible();
  });

  test('데스크톱 뷰포트', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // 사이드바 확인 (데스크톱에서만 표시)
    await expect(page.locator('aside')).toBeVisible();
  });
});

test.describe('접근성 테스트', () => {
  test('키보드 네비게이션', async ({ page }) => {
    await page.goto('/');

    // Tab 키로 이동
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // 포커스된 요소 확인
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('ARIA 레이블 확인', async ({ page }) => {
    await page.goto('/');

    // 주요 랜드마크 확인
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});

test.describe('성능 테스트', () => {
  test('페이지 로드 시간', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await waitForPageLoad(page);
    const loadTime = Date.now() - startTime;

    // 3초 이내 로드
    expect(loadTime).toBeLessThan(3000);
    console.log(`페이지 로드 시간: ${loadTime}ms`);
  });
});

test.describe('에러 처리 테스트', () => {
  test('404 페이지', async ({ page }) => {
    const response = await page.goto('/nonexistent-page');

    // 404 상태 코드 또는 에러 페이지 확인
    expect(response?.status()).toBe(404);
    // 또는 SPA의 경우:
    // await expect(page.getByText('페이지를 찾을 수 없습니다')).toBeVisible();
  });
});
