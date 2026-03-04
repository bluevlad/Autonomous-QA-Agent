/**
 * QA Dashboard 데이터 전송 모듈
 *
 * QA Agent 실행 결과를 Dashboard API로 전송합니다.
 * 실패 시 5초 후 1회 재시도, 그래도 실패하면 파이프라인 중단 없이 로그만 출력합니다.
 */

import { schedulerConfig } from './config.js';
import type { SchedulerRunResult } from './types.js';

const TIMEOUT_MS = 30_000;
const RETRY_DELAY_MS = 5_000;

async function postToDashboard(
  url: string,
  apiKey: string,
  body: string,
): Promise<{ ok: boolean; status?: number; detail?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { ok: false, status: res.status, detail };
    }

    const data = await res.json();
    return { ok: true, detail: `runId: ${data.runId}, dbId: ${data.dbId}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, detail: msg };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendToDashboard(
  result: SchedulerRunResult,
): Promise<boolean> {
  const { dashboardApiUrl, dashboardApiKey } = schedulerConfig;

  if (!dashboardApiUrl) {
    console.log('[Dashboard] DASHBOARD_API_URL 미설정, 건너뜀');
    return false;
  }

  const url = `${dashboardApiUrl}/api/ingest`;
  const body = JSON.stringify(result);

  // 1차 시도
  const first = await postToDashboard(url, dashboardApiKey, body);
  if (first.ok) {
    console.log(`[Dashboard] 전송 성공 (${first.detail})`);
    return true;
  }

  console.warn(`[Dashboard] 1차 전송 실패: ${first.status || ''} ${first.detail}`);
  console.log(`[Dashboard] ${RETRY_DELAY_MS / 1000}초 후 재시도...`);

  await sleep(RETRY_DELAY_MS);

  // 2차 시도 (재시도)
  const second = await postToDashboard(url, dashboardApiKey, body);
  if (second.ok) {
    console.log(`[Dashboard] 재시도 성공 (${second.detail})`);
    return true;
  }

  console.error(`[Dashboard] 재시도 실패: ${second.status || ''} ${second.detail}`);
  console.error(`[Dashboard] runId=${result.runId} 전송 실패 - 로컬 JSON 로그에서 복구 필요`);
  return false;
}
