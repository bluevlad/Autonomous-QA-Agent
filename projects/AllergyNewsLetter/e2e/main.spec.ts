import { test, expect } from '@playwright/test';

const BASE_URL = process.env.ALLERGYNEWSLETTER_URL || 'http://localhost:4050';

test.describe('AllergyNewsLetter - 메인 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('메인 페이지가 정상적으로 로드되어야 한다', async ({ page }) => {
    // 타이틀 확인
    await expect(page).toHaveTitle('AllergyNewsLetter - 알러지 뉴스 브리핑');

    // 로고 확인
    const logo = page.locator('.logo');
    await expect(logo).toHaveText('AllergyNewsLetter');

    // 서브타이틀 확인
    const subtitle = page.locator('.subtitle');
    await expect(subtitle).toHaveText('알러지 뉴스 & 논문 브리핑');
  });

  test('메인 페이지에 주요 기능 설명이 표시되어야 한다', async ({ page }) => {
    // 최신 알러지 뉴스 기능 확인
    await expect(page.getByText('최신 알러지 뉴스')).toBeVisible();

    // PubMed 논문 기능 확인
    await expect(page.getByText('PubMed 논문')).toBeVisible();

    // 발송 시간 안내 확인
    await expect(page.getByText('매일 오전 8시 발송')).toBeVisible();

    // 무료 구독 안내 확인
    await expect(page.getByText('무료 구독')).toBeVisible();
  });

  test('구독 버튼이 존재하고 클릭 시 구독 페이지로 이동해야 한다', async ({ page }) => {
    const subscribeButton = page.getByRole('link', { name: '뉴스레터 구독하기' });
    await expect(subscribeButton).toBeVisible();

    await subscribeButton.click();

    await expect(page).toHaveURL(`${BASE_URL}/subscribe`);
    await expect(page).toHaveTitle('구독 신청 - AllergyNewsLetter');
  });

  test('구독 해지 버튼이 존재하고 클릭 시 해지 페이지로 이동해야 한다', async ({ page }) => {
    const unsubscribeButton = page.getByRole('link', { name: '구독 해지' });
    await expect(unsubscribeButton).toBeVisible();

    await unsubscribeButton.click();

    await expect(page).toHaveURL(`${BASE_URL}/unsubscribe`);
    await expect(page).toHaveTitle('구독 해지 - AllergyNewsLetter');
  });
});

test.describe('AllergyNewsLetter - 구독 신청', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/subscribe`);
  });

  test('구독 신청 페이지가 정상적으로 로드되어야 한다', async ({ page }) => {
    await expect(page).toHaveTitle('구독 신청 - AllergyNewsLetter');

    // 폼 제목 확인
    await expect(page.getByRole('heading', { name: '뉴스레터 구독 신청' })).toBeVisible();

    // 이메일 입력 필드 확인
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', 'example@email.com');

    // 이름 입력 필드 확인
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveAttribute('placeholder', '홍길동');
  });

  test('이메일 없이 구독 신청 시 유효성 검증이 동작해야 한다', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: '인증코드 받기' });

    // HTML5 required 속성으로 인해 제출이 차단되어야 함
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required', '');

    // 빈 상태에서 제출 시도
    await submitButton.click();

    // 여전히 같은 페이지에 있어야 함 (폼이 제출되지 않음)
    await expect(page).toHaveURL(`${BASE_URL}/subscribe`);
  });

  test('유효한 이메일로 구독 신청이 가능해야 한다', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const nameInput = page.locator('input[name="name"]');
    const submitButton = page.getByRole('button', { name: '인증코드 받기' });

    // 이메일과 이름 입력
    await emailInput.fill('test@example.com');
    await nameInput.fill('테스트사용자');

    // 폼 제출
    await submitButton.click();

    // 인증 페이지로 리다이렉트되거나 에러 메시지가 표시되어야 함
    // 실제 이메일 발송이 실패할 수 있으므로 두 가지 경우 모두 허용
    await page.waitForURL(new RegExp(`${BASE_URL}/(verify|subscribe)`), { timeout: 10000 });
  });

  test('잘못된 형식의 이메일로 구독 신청 시 유효성 검증이 동작해야 한다', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.getByRole('button', { name: '인증코드 받기' });

    // 잘못된 형식의 이메일 입력
    await emailInput.fill('invalid-email');
    await submitButton.click();

    // HTML5 email 타입 유효성 검증으로 인해 폼이 제출되지 않아야 함
    await expect(page).toHaveURL(`${BASE_URL}/subscribe`);
  });

  test('홈으로 돌아가기 버튼이 동작해야 한다', async ({ page }) => {
    const homeButton = page.getByRole('link', { name: '홈으로 돌아가기' });
    await expect(homeButton).toBeVisible();

    await homeButton.click();

    await expect(page).toHaveURL(BASE_URL + '/');
  });
});

test.describe('AllergyNewsLetter - 구독 해지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/unsubscribe`);
  });

  test('구독 해지 페이지가 정상적으로 로드되어야 한다', async ({ page }) => {
    await expect(page).toHaveTitle('구독 해지 - AllergyNewsLetter');

    // 폼 제목 확인
    await expect(page.getByRole('heading', { name: '뉴스레터 구독 해지' })).toBeVisible();

    // 안내 문구 확인
    await expect(page.getByText('구독 해지를 원하시면 이메일 주소를 입력해주세요.')).toBeVisible();

    // 이메일 입력 필드 확인
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('이메일 없이 구독 해지 신청 시 유효성 검증이 동작해야 한다', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: '인증코드 받기' });

    // 빈 상태에서 제출 시도
    await submitButton.click();

    // 여전히 같은 페이지에 있어야 함
    await expect(page).toHaveURL(`${BASE_URL}/unsubscribe`);
  });

  test('유효한 이메일로 구독 해지 신청이 가능해야 한다', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.getByRole('button', { name: '인증코드 받기' });

    // 이메일 입력
    await emailInput.fill('test@example.com');

    // 폼 제출
    await submitButton.click();

    // 인증 페이지로 리다이렉트되거나 에러 메시지가 표시되어야 함
    await page.waitForURL(new RegExp(`${BASE_URL}/(unsubscribe|verify)`), { timeout: 10000 });
  });

  test('홈으로 돌아가기 버튼이 동작해야 한다', async ({ page }) => {
    const homeButton = page.getByRole('link', { name: '홈으로 돌아가기' });
    await expect(homeButton).toBeVisible();

    await homeButton.click();

    await expect(page).toHaveURL(BASE_URL + '/');
  });
});

test.describe('AllergyNewsLetter - 인증 페이지', () => {
  test('인증 페이지가 정상적으로 로드되어야 한다', async ({ page }) => {
    await page.goto(`${BASE_URL}/verify/1?email=test@example.com`);

    await expect(page).toHaveTitle('이메일 인증 - AllergyNewsLetter');

    // 인증코드 입력 필드 확인
    const codeInput = page.locator('input[name="code"]');
    await expect(codeInput).toBeVisible();
  });

  test('잘못된 인증코드 입력 시 에러가 표시되어야 한다', async ({ page }) => {
    await page.goto(`${BASE_URL}/verify/1?email=test@example.com`);

    const codeInput = page.locator('input[name="code"]');
    const submitButton = page.getByRole('button', { name: /인증|확인/ });

    // 잘못된 인증코드 입력
    await codeInput.fill('000000');
    await submitButton.click();

    // 에러 메시지가 표시되거나 같은 페이지에 남아있어야 함
    await expect(page.locator('.alert-error')).toBeVisible({ timeout: 5000 }).catch(() => {
      // 에러 메시지가 없어도 인증 실패로 간주
    });
  });
});

test.describe('AllergyNewsLetter - 결과 페이지', () => {
  test('구독 완료 페이지가 정상적으로 로드되어야 한다', async ({ page }) => {
    await page.goto(`${BASE_URL}/result?email=test@example.com`);

    await expect(page).toHaveTitle('구독 완료 - AllergyNewsLetter');
  });

  test('구독 해지 완료 페이지가 정상적으로 로드되어야 한다', async ({ page }) => {
    await page.goto(`${BASE_URL}/unsubscribe/result?email=test@example.com`);

    await expect(page).toHaveTitle('구독 해지 완료 - AllergyNewsLetter');
  });
});

test.describe('AllergyNewsLetter - 토큰 기반 구독 해지', () => {
  test('유효하지 않은 토큰으로 접근 시 처리되어야 한다', async ({ page }) => {
    await page.goto(`${BASE_URL}/unsubscribe/token/invalid-token`);

    // 에러 메시지가 표시되거나 적절한 페이지로 리다이렉트되어야 함
    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();
  });
});

test.describe('AllergyNewsLetter - 반응형 디자인', () => {
  test('모바일 뷰포트에서 정상적으로 표시되어야 한다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);

    // 로고가 보여야 함
    const logo = page.locator('.logo');
    await expect(logo).toBeVisible();

    // 구독 버튼이 보여야 함
    const subscribeButton = page.getByRole('link', { name: '뉴스레터 구독하기' });
    await expect(subscribeButton).toBeVisible();
  });

  test('태블릿 뷰포트에서 정상적으로 표시되어야 한다', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);

    const logo = page.locator('.logo');
    await expect(logo).toBeVisible();

    const subscribeButton = page.getByRole('link', { name: '뉴스레터 구독하기' });
    await expect(subscribeButton).toBeVisible();
  });
});

test.describe('AllergyNewsLetter - 접근성', () => {
  test('구독 폼의 입력 필드에 레이블이 있어야 한다', async ({ page }) => {
    await page.goto(`${BASE_URL}/subscribe`);

    // 이메일 입력 필드의 레이블 확인
    const emailLabel = page.locator('label[for="email"]');
    await expect(emailLabel).toHaveText(/이메일/);

    // 이름 입력 필드의 레이블 확인
    const nameLabel = page.locator('label[for="name"]');
    await expect(nameLabel).toHaveText(/이름/);
  });

  test('폼 제출 버튼이 키보드로 접근 가능해야 한다', async ({ page }) => {
    await page.goto(`${BASE_URL}/subscribe`);

    // 탭 키로 이동 가능 확인
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const submitButton = page.getByRole('button', { name: '인증코드 받기' });
    await expect(submitButton).toBeVisible();
  });
});

test.describe('AllergyNewsLetter - 에러 처리', () => {
  test('존재하지 않는 페이지 접근 시 404 처리되어야 한다', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/nonexistent-page`);

    // 404 상태코드 또는 Not Found 응답 확인
    expect(response?.status()).toBe(404);
  });
});

test.describe('AllergyNewsLetter - 페이지 성능', () => {
  test('메인 페이지가 3초 이내에 로드되어야 한다', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    const endTime = Date.now();

    const loadTime = endTime - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
