/**
 * QA 자동 점검 스케줄러 - 엔트리포인트
 *
 * 사용법:
 *   npm run scheduler:start   → cron 모드 (프로세스 상주, 매일 22:00 KST)
 *   npm run scheduler:run     → 즉시 1회 실행 후 종료
 */

import cron from 'node-cron';
import dotenv from 'dotenv';
import { schedulerConfig, projects } from './config.js';
import { checkAllProjects } from './health-checker.js';
import { runAllTests } from './test-runner.js';
import { saveRunLog, cleanOldLogs } from './logger.js';
import { sendSlackNotification } from './slack-notifier.js';
import { reportFailuresToGitHub } from './issue-reporter.js';
import { sendToDashboard } from './dashboard-sender.js';
import type { SchedulerRunResult } from './types.js';

dotenv.config();

function generateRunId(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  );
}

async function executeRun(): Promise<void> {
  const runId = generateRunId();
  const startedAt = new Date().toISOString();
  const startMs = Date.now();

  console.log(`\n${'='.repeat(60)}`);
  console.log(`[스케줄러] 실행 시작 (runId: ${runId})`);
  console.log(`[스케줄러] 대상: ${projects.length}개 프로젝트`);
  console.log(`${'='.repeat(60)}\n`);

  // Phase 1: Health Check
  console.log('[Phase 1] Health Check 시작...');
  const healthResults = await checkAllProjects();

  const healthyCount = healthResults.filter((r) => r.healthy).length;
  console.log(
    `[Phase 1] 완료 - ${healthyCount}/${healthResults.length}개 정상`,
  );

  for (const hr of healthResults) {
    const icon = hr.healthy ? 'O' : 'X';
    const details = hr.endpoints
      .map((e) => {
        const ms = e.responseTimeMs ? `${e.responseTimeMs}ms` : 'N/A';
        return `${e.label}:${e.healthy ? ms : 'FAIL'}`;
      })
      .join(', ');
    console.log(`  [${icon}] ${hr.projectName} (${details})`);
  }

  // Phase 2: Playwright 테스트
  console.log('\n[Phase 2] Playwright 테스트 시작...');
  const testResults = await runAllTests(healthResults);

  // Summary 계산
  const testedProjects = testResults.filter((r) => r.executed).length;
  const totalTests = testResults.reduce((sum, r) => sum + r.total, 0);
  const totalPassed = testResults.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = testResults.reduce((sum, r) => sum + r.failed, 0);
  const totalSkipped = testResults.reduce((sum, r) => sum + r.skipped, 0);

  console.log(
    `[Phase 2] 완료 - ${testedProjects}개 프로젝트 테스트, ${totalPassed}통과/${totalFailed}실패/${totalSkipped}스킵`,
  );

  const finishedAt = new Date().toISOString();
  const durationMs = Date.now() - startMs;

  const runResult: SchedulerRunResult = {
    runId,
    startedAt,
    finishedAt,
    durationMs,
    healthResults,
    testResults,
    summary: {
      totalProjects: projects.length,
      healthyProjects: healthyCount,
      testedProjects,
      totalTests,
      totalPassed,
      totalFailed,
      totalSkipped,
    },
  };

  // Phase 3: 로그 저장
  console.log('\n[Phase 3] 로그 저장...');
  const logPath = saveRunLog(runResult);
  console.log(`[Phase 3] 저장 완료: ${logPath}`);

  // Phase 3.5: Dashboard 전송
  if (schedulerConfig.dashboardApiUrl) {
    console.log('\n[Phase 3.5] Dashboard 전송...');
    const sent = await sendToDashboard(runResult);
    console.log(`[Phase 3.5] ${sent ? '전송 완료' : '전송 실패 (파이프라인 계속)'}`);
  }

  // Phase 4: Slack 알림
  console.log('\n[Phase 4] Slack 알림...');
  await sendSlackNotification(runResult);

  // Phase 5: GitHub Issues 등록 (실패 있을 때만)
  if (runResult.summary.totalFailed > 0 || runResult.summary.healthyProjects < runResult.summary.totalProjects) {
    console.log('\n[Phase 5] GitHub Issues 등록...');
    const issueResults = await reportFailuresToGitHub(runResult);
    runResult.issueResults = issueResults;

    const created = issueResults.filter((r) => r.action === 'created').length;
    const commented = issueResults.filter((r) => r.action === 'commented').length;
    console.log(`[Phase 5] 완료 - 신규 ${created}건, 코멘트 ${commented}건`);
  } else {
    console.log('\n[Phase 5] GitHub Issues - 실패 없음, 건너뜀');
  }

  // Phase 6: 오래된 로그 정리
  console.log('\n[Phase 6] 오래된 로그 정리...');
  const deleted = cleanOldLogs();
  if (deleted > 0) {
    console.log(`[Phase 6] ${deleted}개 로그 삭제`);
  } else {
    console.log('[Phase 6] 정리할 로그 없음');
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(
    `[스케줄러] 실행 완료 (소요: ${Math.round(durationMs / 1000)}초)`,
  );
  console.log(`${'='.repeat(60)}\n`);
}

// CLI 인자 파싱
const isImmediateRun = process.argv.includes('--run');

if (isImmediateRun) {
  // 즉시 실행 모드
  console.log('[스케줄러] 즉시 실행 모드');
  executeRun()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[스케줄러] 실행 오류:', err);
      process.exit(1);
    });
} else {
  // Cron 모드
  const cronExpr = schedulerConfig.cron;
  console.log(`[스케줄러] Cron 모드 시작 (${cronExpr}, ${schedulerConfig.timezone})`);
  console.log(`[스케줄러] 대상: ${projects.map((p) => p.name).join(', ')}`);
  console.log('[스케줄러] 다음 실행을 대기 중...\n');

  cron.schedule(cronExpr, () => {
    executeRun().catch((err) => {
      console.error('[스케줄러] 실행 오류:', err);
    });
  }, {
    timezone: schedulerConfig.timezone,
  });
}
