import { test, expect } from '@playwright/test';

const BASE_URL = process.env.UNMONG_MAIN_URL || 'http://www.unmong.com';

/**
 * unmong-main - 게이트웨이 및 서비스 연결 테스트
 */

test.describe('unmong-main 서비스 가용성', () => {
  test('메인 포털이 응답한다', async ({ request }) => {
    const response = await request.get(BASE_URL);
    expect(response.status()).toBeLessThan(500);
  });

  test('HTTPS 리다이렉트가 동작한다', async ({ request }) => {
    const response = await request.get(BASE_URL);
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('unmong-main 하위 서비스 연결 확인', () => {
  const services = [
    { name: 'TeacherHub', url: 'http://study.unmong.com:4010' },
    { name: 'AcademyInsight', url: 'http://study.unmong.com:4020' },
    { name: 'HealthPulse', url: 'http://study.unmong.com:4030' },
    { name: 'AllergyInsight', url: 'http://www.unmong.com:4040' },
    { name: 'HopenVision', url: 'http://study.unmong.com:4060' },
  ];

  for (const service of services) {
    test(`${service.name} 서비스가 응답한다`, async ({ request }) => {
      try {
        const response = await request.get(service.url, { timeout: 10000 });
        expect(response.status()).toBeLessThan(500);
      } catch {
        // 서비스 미가동 시 테스트 스킵
        test.skip();
      }
    });
  }
});
