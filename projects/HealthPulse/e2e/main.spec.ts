import { test, expect } from '@playwright/test';

const BASE_URL = process.env.HEALTHPULSE_URL || 'http://study.unmong.com:4030';

test.describe('HealthPulse 메인 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('메인 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    // 타이틀 확인
    await expect(page).toHaveTitle(/HealthPulse/);

    // 로고 확인
    await expect(page.getByRole('heading', { name: 'HealthPulse' })).toBeVisible();
    await expect(page.getByText('디지털 헬스케어 뉴스레터')).toBeVisible();
  });

  test('기능 소개 섹션이 표시되어야 함', async ({ page }) => {
    // 기능 소개 확인
    await expect(page.getByText('매일 선별된 뉴스')).toBeVisible();
    await expect(page.getByText('AI 기반 요약')).toBeVisible();
    await expect(page.getByText('맞춤형 키워드')).toBeVisible();
    await expect(page.getByText('개인정보 보호')).toBeVisible();
  });

  test('구독하기 버튼이 표시되고 클릭 가능해야 함', async ({ page }) => {
    const subscribeButton = page.getByRole('link', { name: '뉴스레터 구독하기' });
    await expect(subscribeButton).toBeVisible();

    // 버튼 클릭 시 구독 페이지로 이동
    await subscribeButton.click();
    await expect(page).toHaveURL(/\/subscribe/);
  });

  test('푸터가 표시되어야 함', async ({ page }) => {
    await expect(page.getByText('2024 HealthPulse. All rights reserved.')).toBeVisible();
  });
});

test.describe('HealthPulse 구독 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/subscribe`);
  });

  test('구독 폼이 정상적으로 표시되어야 함', async ({ page }) => {
    // 타이틀 확인
    await expect(page).toHaveTitle(/구독 신청/);

    // 폼 필드 확인
    await expect(page.getByLabel('이메일 주소 *')).toBeVisible();
    await expect(page.getByLabel('이름 *')).toBeVisible();
    await expect(page.getByLabel('관심 분야 (선택사항)')).toBeVisible();
  });

  test('이메일 필드 placeholder가 표시되어야 함', async ({ page }) => {
    const emailInput = page.getByPlaceholder('example@email.com');
    await expect(emailInput).toBeVisible();
  });

  test('이름 필드 placeholder가 표시되어야 함', async ({ page }) => {
    const nameInput = page.getByPlaceholder('홍길동');
    await expect(nameInput).toBeVisible();
  });

  test('관심 분야 필드 placeholder가 표시되어야 함', async ({ page }) => {
    const keywordsInput = page.getByPlaceholder('예: AI 진단, FDA, 투자');
    await expect(keywordsInput).toBeVisible();
  });

  test('힌트 텍스트가 표시되어야 함', async ({ page }) => {
    await expect(page.getByText('쉼표로 구분하여 입력하세요. 비워두면 모든 헬스케어 뉴스를 받습니다.')).toBeVisible();
  });

  test('구독 신청 버튼이 표시되어야 함', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: '구독 신청' });
    await expect(submitButton).toBeVisible();
  });

  test('홈으로 돌아가기 링크가 작동해야 함', async ({ page }) => {
    const homeLink = page.getByRole('link', { name: /홈으로 돌아가기/ });
    await expect(homeLink).toBeVisible();

    await homeLink.click();
    await expect(page).toHaveURL(BASE_URL);
  });

  test('유효한 이메일로 구독 신청 시 인증 페이지로 이동해야 함', async ({ page }) => {
    // 폼 작성
    await page.getByLabel('이메일 주소 *').fill('test@example.com');
    await page.getByLabel('이름 *').fill('테스트 사용자');
    await page.getByLabel('관심 분야 (선택사항)').fill('AI, 디지털헬스');

    // 구독 신청
    await page.getByRole('button', { name: '구독 신청' }).click();

    // 인증 페이지로 이동 확인 (또는 인증 코드 입력 폼 표시)
    await expect(page.getByText('인증')).toBeVisible({ timeout: 10000 });
  });

  test('필수 필드가 비어있을 때 HTML5 유효성 검사가 작동해야 함', async ({ page }) => {
    // 빈 폼으로 제출 시도
    await page.getByRole('button', { name: '구독 신청' }).click();

    // 이메일 필드가 required 속성을 가지고 있는지 확인
    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveAttribute('required', '');

    // 이름 필드가 required 속성을 가지고 있는지 확인
    const nameInput = page.locator('#name');
    await expect(nameInput).toHaveAttribute('required', '');
  });
});

test.describe('HealthPulse 관리자 대시보드', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
  });

  test('관리자 대시보드가 정상적으로 로드되어야 함', async ({ page }) => {
    // 타이틀 확인
    await expect(page).toHaveTitle(/관리자 대시보드/);

    // 사이드바 로고 확인
    await expect(page.getByText('Admin Dashboard')).toBeVisible();
  });

  test('사이드바 네비게이션이 표시되어야 함', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Dashboard/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Subscribers/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Send History/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Articles/ })).toBeVisible();
  });

  test('통계 카드가 표시되어야 함', async ({ page }) => {
    await expect(page.getByText('Active Subscribers')).toBeVisible();
    await expect(page.getByText('Articles Collected')).toBeVisible();
    await expect(page.getByText('Emails Sent')).toBeVisible();
    await expect(page.getByText('Failed Sends')).toBeVisible();
  });

  test('날짜 필터가 작동해야 함', async ({ page }) => {
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();

    // 날짜 변경
    await dateInput.fill('2026-02-07');
    await page.getByRole('button', { name: 'View' }).click();

    // URL에 날짜 파라미터가 포함되어야 함
    await expect(page).toHaveURL(/date=2026-02-07/);
  });

  test('Go to Site 링크가 작동해야 함', async ({ page }) => {
    const siteLink = page.getByRole('link', { name: /Go to Site/ });
    await expect(siteLink).toBeVisible();

    await siteLink.click();
    await expect(page).toHaveURL(BASE_URL);
  });
});

test.describe('HealthPulse 구독자 관리 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/subscribers`);
  });

  test('구독자 관리 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await expect(page).toHaveTitle(/구독자 관리/);
    await expect(page.getByText('Subscriber Management')).toBeVisible();
  });

  test('구독자 통계 카드가 표시되어야 함', async ({ page }) => {
    await expect(page.getByText('Total Subscribers')).toBeVisible();
    await expect(page.getByText('Active')).toBeVisible();
    await expect(page.getByText('Inactive')).toBeVisible();
  });

  test('필터 탭이 작동해야 함', async ({ page }) => {
    // All 탭 확인
    const allTab = page.getByRole('link', { name: /All/ });
    await expect(allTab).toBeVisible();

    // Active 탭 클릭
    await page.getByRole('link', { name: /Active \(\d+\)/ }).click();
    await expect(page).toHaveURL(/status=active/);

    // Inactive 탭 클릭
    await page.getByRole('link', { name: /Inactive/ }).click();
    await expect(page).toHaveURL(/status=inactive/);
  });

  test('구독자 테이블이 표시되어야 함', async ({ page }) => {
    // 테이블 헤더 확인
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
  });
});

test.describe('HealthPulse 발송 이력 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/send-history`);
  });

  test('발송 이력 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await expect(page).toHaveTitle(/발송 이력/);
    await expect(page.getByText('Send History')).toBeVisible();
  });

  test('날짜 필터가 표시되어야 함', async ({ page }) => {
    await expect(page.locator('input[type="date"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Filter' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Show All' })).toBeVisible();
  });

  test('발송 이력 테이블이 표시되어야 함', async ({ page }) => {
    // 테이블 헤더 확인
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Recipient' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Subject' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
  });

  test('성공/실패 배지가 표시되어야 함', async ({ page }) => {
    // Success 또는 Failed 배지가 있는지 확인
    const badges = page.locator('.badge');
    await expect(badges.first()).toBeVisible();
  });
});

test.describe('HealthPulse 수집 기사 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/articles`);
  });

  test('수집 기사 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    await expect(page).toHaveTitle(/수집 기사/);
    await expect(page.getByText('Collected Articles')).toBeVisible();
  });

  test('기사 테이블이 표시되어야 함', async ({ page }) => {
    // 테이블 헤더 확인
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Title' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Source' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Score' })).toBeVisible();
  });

  test('날짜 필터가 작동해야 함', async ({ page }) => {
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill('2026-02-07');
    await page.getByRole('button', { name: 'Filter' }).click();

    await expect(page).toHaveURL(/date=2026-02-07/);
  });
});

test.describe('HealthPulse 구독 해지 페이지', () => {
  test('잘못된 토큰으로 접근 시 오류 메시지가 표시되어야 함', async ({ page }) => {
    await page.goto(`${BASE_URL}/unsubscribe/invalid-token`);

    // 오류 메시지 확인
    await expect(page.getByText('유효하지 않거나 이미 사용된 구독 해지 링크입니다')).toBeVisible();

    // 홈으로 돌아가기 버튼 확인
    await expect(page.getByRole('link', { name: '홈으로 돌아가기' })).toBeVisible();
  });
});

test.describe('HealthPulse 구독 관리 페이지', () => {
  test('잘못된 토큰으로 접근 시 오류가 발생해야 함', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/manage/invalid-token`);

    // 404 또는 오류 응답 확인
    expect(response?.status()).toBe(404);
  });
});

test.describe('HealthPulse 반응형 디자인', () => {
  test('모바일 뷰포트에서 메인 페이지가 정상적으로 표시되어야 함', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);

    // 주요 요소 확인
    await expect(page.getByRole('heading', { name: 'HealthPulse' })).toBeVisible();
    await expect(page.getByRole('link', { name: '뉴스레터 구독하기' })).toBeVisible();
  });

  test('태블릿 뷰포트에서 관리자 페이지가 정상적으로 표시되어야 함', async ({ page }) => {
    // 태블릿 뷰포트 설정
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/admin`);

    // 사이드바와 메인 콘텐츠 확인
    await expect(page.getByText('Admin Dashboard')).toBeVisible();
  });
});

test.describe('HealthPulse 접근성', () => {
  test('메인 페이지의 모든 링크가 접근 가능해야 함', async ({ page }) => {
    await page.goto(BASE_URL);

    // 모든 링크가 href 속성을 가지고 있는지 확인
    const links = page.locator('a');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).not.toBeNull();
    }
  });

  test('폼 필드에 적절한 레이블이 있어야 함', async ({ page }) => {
    await page.goto(`${BASE_URL}/subscribe`);

    // 각 입력 필드에 연결된 레이블 확인
    await expect(page.getByLabel('이메일 주소 *')).toBeVisible();
    await expect(page.getByLabel('이름 *')).toBeVisible();
    await expect(page.getByLabel('관심 분야 (선택사항)')).toBeVisible();
  });
});
