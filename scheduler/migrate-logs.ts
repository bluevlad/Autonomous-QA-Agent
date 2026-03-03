/**
 * QA 로그 → Dashboard DB 일괄 마이그레이션 도구
 *
 * scheduler/logs/ 내 JSON 파일을 Dashboard API(/api/ingest)로 전송합니다.
 * ON CONFLICT (run_id) DO UPDATE로 멱등성이 보장되어 중복 실행해도 안전합니다.
 *
 * 사용법:
 *   npm run migrate:logs              # 미전송 파일만 전송
 *   npm run migrate:logs -- --all     # 전체 재전송 (강제)
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { schedulerConfig } from './config.js';

dotenv.config();

const TIMEOUT_MS = 30_000;
const MIGRATED_SUFFIX = '.migrated';

async function sendToApi(jsonStr: string): Promise<{ ok: boolean; detail: string }> {
  const url = `${schedulerConfig.dashboardApiUrl}/api/ingest`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${schedulerConfig.dashboardApiKey}`,
      },
      body: jsonStr,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, detail: `${res.status} ${body}` };
    }

    const data = await res.json();
    return { ok: true, detail: `runId=${data.runId}, dbId=${data.dbId}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, detail: msg };
  }
}

async function main() {
  const forceAll = process.argv.includes('--all');
  const logDir = path.resolve(schedulerConfig.logDir);

  if (!schedulerConfig.dashboardApiUrl) {
    console.error('[마이그레이션] DASHBOARD_API_URL이 설정되지 않았습니다.');
    console.error('[마이그레이션] .env 파일에 DASHBOARD_API_URL을 설정하세요.');
    process.exit(1);
  }

  if (!fs.existsSync(logDir)) {
    console.error(`[마이그레이션] 로그 디렉토리 없음: ${logDir}`);
    process.exit(1);
  }

  const allFiles = fs.readdirSync(logDir).filter((f) => f.endsWith('.json'));

  // .migrated 마커 파일이 없는 것만 대상 (--all이면 전체)
  const targetFiles = forceAll
    ? allFiles
    : allFiles.filter((f) => !fs.existsSync(path.join(logDir, f + MIGRATED_SUFFIX)));

  console.log(`[마이그레이션] 대상: ${targetFiles.length}/${allFiles.length}개 파일 (${forceAll ? '전체' : '미전송'})`);
  console.log(`[마이그레이션] API: ${schedulerConfig.dashboardApiUrl}`);

  if (targetFiles.length === 0) {
    console.log('[마이그레이션] 전송할 파일 없음');
    return;
  }

  let success = 0;
  let fail = 0;

  for (const file of targetFiles.sort()) {
    const filePath = path.join(logDir, file);
    const jsonStr = fs.readFileSync(filePath, 'utf-8');

    const result = await sendToApi(jsonStr);

    if (result.ok) {
      success++;
      // 전송 성공 마커 파일 생성
      fs.writeFileSync(
        path.join(logDir, file + MIGRATED_SUFFIX),
        new Date().toISOString(),
      );
      console.log(`  [O] ${file} → ${result.detail}`);
    } else {
      fail++;
      console.log(`  [X] ${file} → ${result.detail}`);
    }
  }

  console.log(`\n[마이그레이션] 완료: 성공 ${success}, 실패 ${fail}`);

  if (fail > 0) {
    console.log('[마이그레이션] 실패한 파일은 다음 실행 시 재시도됩니다.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[마이그레이션] 오류:', err);
  process.exit(1);
});
