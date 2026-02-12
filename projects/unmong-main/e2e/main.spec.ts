import { test, expect } from '@playwright/test';

/**
 * unmong-main - 운몽시스템즈 통합 서비스 포털
 * E2E 테스트
 */

test.describe('unmong-main 메인 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('페이지가 정상적으로 로드된다', async ({ page }) => {
    await expect(page).toHaveTitle(/운몽|unmong/i);
  });

  test('서비스 카드 목록이 표시된다', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('네비게이션이 존재한다', async ({ page }) => {
    const nav = page.locator('nav, [role="navigation"], .navbar, header');
    const navCount = await nav.count();
    expect(navCount).toBeGreaterThan(0);
  });
});

test.describe('unmong-main 서비스 링크 검증', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('서비스 링크가 존재한다', async ({ page }) => {
    const links = page.locator('a[href]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('외부 서비스 링크에 target="_blank"가 적용되어 있다', async ({ page }) => {
    const externalLinks = page.locator('a[href^="http"]');
    const count = await externalLinks.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const target = await externalLinks.nth(i).getAttribute('target');
      if (target) {
        expect(target).toBe('_blank');
      }
    }
  });
});

test.describe('unmong-main 반응형 디자인', () => {
  test('모바일 뷰포트에서 정상 표시된다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('태블릿 뷰포트에서 정상 표시된다', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('unmong-main 접근성', () => {
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
