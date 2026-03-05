import { test, expect } from '@playwright/test';

const API_URL = process.env.DASHBOARD_API_URL || 'http://172.30.1.72:9095';

/**
 * DB 마이그레이션 파이프라인 검증
 *
 * 로컬 스케줄러(22:00) → JSON 로그 생성 → Migrate(22:30) → Dashboard DB 전송
 * 이 테스트는 마이그레이션이 정상 작동하는지 검증합니다.
 */

test.describe('DB 마이그레이션 검증', () => {
  test('최근 48시간 이내 QA 실행 데이터가 DB에 존재한다', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/runs?limit=1`);
    expect(response.status()).toBe(200);

    const runs = await response.json();
    expect(runs.length).toBeGreaterThan(0);

    // 가장 최근 실행이 48시간 이내인지 확인
    const latestRun = runs[0];
    const runTime = new Date(latestRun.started_at || latestRun.startedAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - runTime.getTime()) / (1000 * 60 * 60);

    expect(hoursDiff).toBeLessThan(48);
  });

  test('최근 실행 데이터에 필수 필드가 존재한다', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/runs?limit=1`);
    expect(response.status()).toBe(200);

    const runs = await response.json();
    if (runs.length === 0) {
      test.skip();
      return;
    }

    const run = runs[0];
    // 필수 필드 존재 확인
    expect(run).toHaveProperty('run_id');
    expect(run).toHaveProperty('started_at');
    expect(run).toHaveProperty('total_projects');
  });

  test('프로젝트 타임라인 데이터를 조회할 수 있다', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/timeline?days=7`);
    expect(response.status()).toBe(200);

    const timeline = await response.json();
    expect(Array.isArray(timeline)).toBe(true);
  });
});
