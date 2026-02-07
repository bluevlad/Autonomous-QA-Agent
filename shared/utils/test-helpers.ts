import { Page, expect } from '@playwright/test';

/**
 * 페이지 로드 완료 대기
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * API 응답 대기 및 검증
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  options?: { status?: number; timeout?: number }
): Promise<any> {
  const response = await page.waitForResponse(
    (res) => {
      const matches = typeof urlPattern === 'string'
        ? res.url().includes(urlPattern)
        : urlPattern.test(res.url());
      return matches && res.status() === (options?.status || 200);
    },
    { timeout: options?.timeout || 30000 }
  );
  return response.json();
}

/**
 * 테이블 데이터 추출
 */
export async function getTableData(
  page: Page,
  tableSelector: string = 'table'
): Promise<string[][]> {
  return page.evaluate((selector) => {
    const table = document.querySelector(selector);
    if (!table) return [];

    const rows = table.querySelectorAll('tbody tr');
    return Array.from(rows).map((row) => {
      const cells = row.querySelectorAll('td');
      return Array.from(cells).map((cell) => cell.textContent?.trim() || '');
    });
  }, tableSelector);
}

/**
 * 폼 필드 입력 헬퍼
 */
export async function fillForm(
  page: Page,
  fields: Record<string, string | number>
): Promise<void> {
  for (const [label, value] of Object.entries(fields)) {
    const input = page.getByLabel(label);
    if (await input.isVisible()) {
      await input.fill(String(value));
    }
  }
}

/**
 * 드롭다운 선택 헬퍼
 */
export async function selectDropdown(
  page: Page,
  placeholder: string,
  optionText: string
): Promise<void> {
  await page.getByPlaceholder(placeholder).click();
  await page.getByText(optionText, { exact: true }).click();
}

/**
 * 성공/에러 메시지 확인
 */
export async function expectMessage(
  page: Page,
  text: string,
  type: 'success' | 'error' | 'warning' = 'success'
): Promise<void> {
  const message = page.getByText(text);
  await expect(message).toBeVisible({ timeout: 10000 });
}

/**
 * 스크린샷 캡처 (디버깅용)
 */
export async function captureScreenshot(
  page: Page,
  name: string
): Promise<void> {
  await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * API 상태 코드 검증
 */
export function expectStatus(
  actualStatus: number,
  expectedStatus: number,
  message?: string
): void {
  if (actualStatus !== expectedStatus) {
    throw new Error(
      message ||
        `Expected status ${expectedStatus}, but got ${actualStatus}`
    );
  }
}
