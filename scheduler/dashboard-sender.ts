/**
 * QA Dashboard 데이터 전송 모듈
 *
 * QA Agent 실행 결과를 Dashboard API로 전송합니다.
 * 실패 시 파이프라인을 중단하지 않고 로그만 출력합니다.
 */

import { schedulerConfig } from './config.js';
import type { SchedulerRunResult } from './types.js';

const TIMEOUT_MS = 30_000;

export async function sendToDashboard(
  result: SchedulerRunResult,
): Promise<boolean> {
  const { dashboardApiUrl, dashboardApiKey } = schedulerConfig;

  if (!dashboardApiUrl) {
    console.log('[Dashboard] DASHBOARD_API_URL 미설정, 건너뜀');
    return false;
  }

  const url = `${dashboardApiUrl}/api/ingest`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${dashboardApiKey}`,
      },
      body: JSON.stringify(result),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`[Dashboard] 전송 실패: ${res.status} ${body}`);
      return false;
    }

    const data = await res.json();
    console.log(`[Dashboard] 전송 성공 (runId: ${data.runId}, dbId: ${data.dbId})`);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Dashboard] 전송 오류: ${msg}`);
    return false;
  }
}
