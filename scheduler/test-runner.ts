/**
 * QA 자동 점검 스케줄러 - Playwright 테스트 실행 모듈
 *
 * child_process.spawn으로 프로젝트별 순차 실행
 * SCHEDULER_MODE=true로 Playwright Slack reporter 비활성화
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { schedulerConfig } from './config.js';
import type { HealthCheckResult, TestRunResult } from './types.js';

interface PlaywrightJsonResult {
  suites?: PlaywrightSuite[];
  stats?: {
    expected?: number;
    unexpected?: number;
    skipped?: number;
    flaky?: number;
  };
}

interface PlaywrightSuite {
  title: string;
  suites?: PlaywrightSuite[];
  specs?: PlaywrightSpec[];
}

interface PlaywrightSpec {
  title: string;
  tests?: PlaywrightTest[];
}

interface PlaywrightTest {
  projectName?: string;
  results?: { status: string }[];
}

function parseResultsJson(projectName: string): {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  failures: string[];
} {
  const resultsPath = path.resolve('test-results/results.json');
  const defaultResult = { passed: 0, failed: 0, skipped: 0, total: 0, failures: [] as string[] };

  if (!fs.existsSync(resultsPath)) return defaultResult;

  try {
    const raw = fs.readFileSync(resultsPath, 'utf-8');
    const data: PlaywrightJsonResult = JSON.parse(raw);

    if (data.stats) {
      const passed = data.stats.expected || 0;
      const failed = data.stats.unexpected || 0;
      const skipped = data.stats.skipped || 0;

      // 실패 테스트 이름 수집
      const failures: string[] = [];
      collectFailures(data.suites || [], projectName, failures);

      return {
        passed,
        failed,
        skipped,
        total: passed + failed + skipped,
        failures,
      };
    }

    return defaultResult;
  } catch {
    return defaultResult;
  }
}

function collectFailures(
  suites: PlaywrightSuite[],
  projectName: string,
  failures: string[],
): void {
  for (const suite of suites) {
    if (suite.suites) collectFailures(suite.suites, projectName, failures);
    if (suite.specs) {
      for (const spec of suite.specs) {
        if (spec.tests) {
          for (const test of spec.tests) {
            if (
              test.projectName === projectName &&
              test.results?.some((r) => r.status === 'unexpected' || r.status === 'failed')
            ) {
              failures.push(spec.title);
            }
          }
        }
      }
    }
  }
}

function runPlaywright(projectName: string): Promise<{ exitCode: number; durationMs: number }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const child = spawn(
      'npx',
      ['playwright', 'test', `--project=${projectName}`],
      {
        shell: true,
        stdio: 'pipe',
        env: {
          ...process.env,
          SCHEDULER_MODE: 'true',
        },
        timeout: schedulerConfig.testTimeout,
      },
    );

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (stdout) console.log(`[${projectName}] stdout:\n${stdout.slice(-500)}`);
      if (stderr) console.log(`[${projectName}] stderr:\n${stderr.slice(-300)}`);
      resolve({ exitCode: code ?? 1, durationMs: Date.now() - start });
    });

    child.on('error', (err) => {
      console.error(`[${projectName}] spawn error:`, err.message);
      resolve({ exitCode: 1, durationMs: Date.now() - start });
    });
  });
}

export async function runProjectTests(
  projectName: string,
  healthResult: HealthCheckResult,
): Promise<TestRunResult> {
  if (!healthResult.healthy) {
    const failedEndpoints = healthResult.endpoints
      .filter((e) => !e.healthy)
      .map((e) => e.error || `${e.label} 미응답`);

    return {
      projectName,
      executed: false,
      skippedReason: `Health Check 실패: ${failedEndpoints.join(', ')}`,
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      exitCode: -1,
      durationMs: 0,
      failures: [],
    };
  }

  console.log(`[${projectName}] Playwright 테스트 시작...`);
  const { exitCode, durationMs } = await runPlaywright(projectName);
  const stats = parseResultsJson(projectName);

  console.log(
    `[${projectName}] 완료 (exit=${exitCode}, ${stats.passed}통과/${stats.failed}실패/${stats.skipped}스킵, ${Math.round(durationMs / 1000)}초)`,
  );

  return {
    projectName,
    executed: true,
    ...stats,
    exitCode,
    durationMs,
  };
}

export async function runAllTests(
  healthResults: HealthCheckResult[],
): Promise<TestRunResult[]> {
  const results: TestRunResult[] = [];

  // 순차 실행 (Playwright 내부에서 병렬 처리)
  for (const health of healthResults) {
    const result = await runProjectTests(health.projectName, health);
    results.push(result);
  }

  return results;
}
