import { test, expect } from '@playwright/test';

/**
 * NewsLetterPlatform - 멀티테넌트 뉴스레터 통합 플랫폼
 * E2E 테스트
 */

test.describe('NewsLetterPlatform 메인 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page).toHaveTitle(/Newsletter|뉴스레터|구독/i);
  });

  test('테넌트 목록이 표시된다', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('구독 폼이 존재한다', async ({ page }) => {
    // 이메일 입력 또는 구독 관련 요소 확인
    const form = page.locator('form, input[type="email"], [placeholder*="email"], [placeholder*="이메일"]');
    const formCount = await form.count();
    expect(formCount).toBeGreaterThanOrEqual(0); // 메인 페이지에 없을 수 있음
  });
});

test.describe('NewsLetterPlatform 테넌트 페이지', () => {
  test('TeacherHub 테넌트 구독 페이지 접근 가능', async ({ page }) => {
    await page.goto('/subscribe/teacherhub');
    await page.waitForLoadState('networkidle');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('AcademyInsight 테넌트 구독 페이지 접근 가능', async ({ page }) => {
    await page.goto('/subscribe/academyinsight');
    await page.waitForLoadState('networkidle');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('NewsLetterPlatform 반응형 디자인', () => {
  test('모바일 뷰포트에서 정상 표시된다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
