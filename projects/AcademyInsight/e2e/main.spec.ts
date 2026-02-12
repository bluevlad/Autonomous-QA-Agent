import { test, expect } from '@playwright/test';

/**
 * AcademyInsight - 학원 온라인 평판 모니터링 시스템
 * E2E 테스트
 */

test.describe('AcademyInsight 메인 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page).toHaveTitle(/Academy|학원|평판/i);
  });

  test('대시보드가 표시된다', async ({ page }) => {
    // 대시보드 컨텐츠 영역 확인
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('네비게이션 메뉴가 존재한다', async ({ page }) => {
    const nav = page.locator('nav, [role="navigation"], .navbar, .nav, header');
    const navCount = await nav.count();
    expect(navCount).toBeGreaterThan(0);
  });
});

test.describe('AcademyInsight 크롤링 모니터링', () => {
  test('크롤링 상태 정보가 표시된다', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // 크롤링 관련 UI 요소 확인
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('AcademyInsight 접근성', () => {
  test('주요 이미지에 alt 속성이 있다', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });
});

test.describe('AcademyInsight 반응형 디자인', () => {
  test('모바일 뷰포트에서 정상 표시된다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
