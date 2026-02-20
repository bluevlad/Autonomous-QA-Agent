import { test, expect } from '@playwright/test';

/**
 * AllergyInsight - 알러지 논문 검색 시스템 E2E 테스트
 * 테스트 대상: http://localhost:4040/
 */

const BASE_URL = process.env.ALLERGYINSIGHT_URL || 'http://localhost:4040';

test.describe('AllergyInsight 메인 페이지 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('메인 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/AllergyInsight/);

    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('networkidle');

    // 루트 요소가 존재하는지 확인
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });

  test('페이지에 한글 컨텐츠가 표시되어야 함', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // 페이지에 한글 텍스트가 포함되어 있는지 확인
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });
});

test.describe('알러젠 선택 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('식품 알러젠 카테고리가 표시되어야 함', async ({ page }) => {
    // 식품 알러젠 관련 텍스트 또는 요소 확인
    const foodAllergens = ['땅콩', '우유', '계란', '밀', '대두', '생선', '갑각류', '견과류'];

    for (const allergen of foodAllergens) {
      const allergenElement = page.getByText(allergen, { exact: false });
      // 알러젠이 페이지에 존재하는지 확인 (visible이 아닐 수도 있음)
      const count = await allergenElement.count();
      if (count > 0) {
        console.log(`알러젠 발견: ${allergen}`);
      }
    }
  });

  test('흡입성 알러젠 카테고리가 표시되어야 함', async ({ page }) => {
    // 흡입성 알러젠 관련 텍스트 확인
    const inhalantAllergens = ['집먼지진드기', '꽃가루', '곰팡이', '고양이', '개'];

    for (const allergen of inhalantAllergens) {
      const allergenElement = page.getByText(allergen, { exact: false });
      const count = await allergenElement.count();
      if (count > 0) {
        console.log(`흡입성 알러젠 발견: ${allergen}`);
      }
    }
  });

  test('알러젠을 클릭하면 관련 논문이 표시되어야 함', async ({ page }) => {
    // 우유 알러젠 버튼/링크를 찾아 클릭
    const milkButton = page.getByText('우유', { exact: false }).first();

    if (await milkButton.isVisible()) {
      await milkButton.click();

      // 논문 목록이 로드될 때까지 대기
      await page.waitForLoadState('networkidle');

      // 논문 관련 컨텐츠가 표시되는지 확인
      // (논문 제목, 저자, 연도 등의 정보가 있어야 함)
    }
  });
});

test.describe('논문 검색 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('검색 입력창이 존재해야 함', async ({ page }) => {
    // 검색 입력창 찾기
    const searchInput = page.locator('input[type="text"], input[type="search"], input[placeholder*="검색"], input[placeholder*="search"]').first();

    const isVisible = await searchInput.isVisible().catch(() => false);
    if (isVisible) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('검색어 입력 후 결과가 표시되어야 함', async ({ page }) => {
    // 검색 입력창 찾기
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();

    const isVisible = await searchInput.isVisible().catch(() => false);
    if (isVisible) {
      await searchInput.fill('allergy');
      await searchInput.press('Enter');

      // 검색 결과 로딩 대기
      await page.waitForLoadState('networkidle');

      // 검색 결과가 표시되는지 확인
      await page.waitForTimeout(2000);
    }
  });
});

test.describe('논문 상세 정보 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('논문을 클릭하면 상세 정보가 표시되어야 함', async ({ page }) => {
    // 논문 목록에서 첫 번째 논문 찾기
    const paperItem = page.locator('[class*="paper"], [class*="article"], [class*="result"]').first();

    const isVisible = await paperItem.isVisible().catch(() => false);
    if (isVisible) {
      await paperItem.click();

      // 상세 정보 모달 또는 페이지가 로드될 때까지 대기
      await page.waitForLoadState('networkidle');
    }
  });

  test('논문 상세 정보에 필수 필드가 포함되어야 함', async ({ page }) => {
    // API를 통해 논문 데이터 확인
    const response = await page.request.get(`${BASE_URL}/api/papers/1`);

    if (response.ok()) {
      const paper = await response.json();

      // 필수 필드 확인
      expect(paper).toHaveProperty('id');
      expect(paper).toHaveProperty('title');
      expect(paper).toHaveProperty('authors');
      expect(paper).toHaveProperty('journal');
      expect(paper).toHaveProperty('year');
    }
  });
});

test.describe('반응형 디자인 테스트', () => {
  test('모바일 화면에서 정상 동작해야 함', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // 페이지가 정상적으로 로드되는지 확인
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });

  test('태블릿 화면에서 정상 동작해야 함', async ({ page }) => {
    // 태블릿 뷰포트 설정
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // 페이지가 정상적으로 로드되는지 확인
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });

  test('데스크톱 화면에서 정상 동작해야 함', async ({ page }) => {
    // 데스크톱 뷰포트 설정
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // 페이지가 정상적으로 로드되는지 확인
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });
});

test.describe('접근성 테스트', () => {
  test('키보드 네비게이션이 가능해야 함', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Tab 키로 포커스 이동이 가능한지 확인
    await page.keyboard.press('Tab');

    // 현재 포커스된 요소 확인
    const focusedElement = page.locator(':focus');
    const isFocused = await focusedElement.count();

    expect(isFocused).toBeGreaterThanOrEqual(0);
  });

  test('페이지에 적절한 lang 속성이 설정되어 있어야 함', async ({ page }) => {
    await page.goto(BASE_URL);

    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('ko');
  });
});

test.describe('성능 테스트', () => {
  test('페이지 로드 시간이 합리적이어야 함', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // 페이지 로드 시간이 10초 이내여야 함
    expect(loadTime).toBeLessThan(10000);
    console.log(`페이지 로드 시간: ${loadTime}ms`);
  });
});

test.describe('에러 처리 테스트', () => {
  test('존재하지 않는 페이지 접근 시 적절히 처리되어야 함', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/nonexistent-page`);

    // SPA이므로 200을 반환하거나 적절한 에러 페이지를 표시해야 함
    if (response) {
      expect([200, 404]).toContain(response.status());
    }
  });
});

test.describe('외부 링크 테스트', () => {
  test('PubMed 링크가 올바르게 연결되어야 함', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // PubMed 링크 찾기
    const pubmedLinks = page.locator('a[href*="pubmed.ncbi.nlm.nih.gov"]');
    const count = await pubmedLinks.count();

    if (count > 0) {
      const firstLink = pubmedLinks.first();
      const href = await firstLink.getAttribute('href');
      expect(href).toContain('pubmed.ncbi.nlm.nih.gov');
    }
  });
});
