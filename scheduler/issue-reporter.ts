/**
 * QA 자동 점검 스케줄러 - GitHub Issues 자동 등록
 *
 * 테스트 실패 또는 서비스 다운 시 해당 프로젝트의 GitHub 저장소에 이슈를 자동 등록합니다.
 * 중복 방지: 동일 프로젝트에 open 상태인 qa-auto 라벨 이슈가 있으면 코멘트로 추가합니다.
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { githubRepoMap } from './config.js';
import type {
  SchedulerRunResult,
  HealthCheckResult,
  TestRunResult,
  IssueReportResult,
} from './types.js';

interface ExistingIssue {
  number: number;
  title: string;
}

function findExistingIssue(repo: string): ExistingIssue | null {
  try {
    const output = execSync(
      `gh issue list --repo ${repo} --label qa-auto --state open --json number,title --limit 1`,
      { encoding: 'utf-8', timeout: 15000 },
    );
    const issues = JSON.parse(output) as ExistingIssue[];
    return issues.length > 0 ? issues[0] : null;
  } catch {
    return null;
  }
}

function buildTestFailureBody(
  runId: string,
  startedAt: string,
  health: HealthCheckResult,
  test: TestRunResult,
): string {
  const runTime = new Date(startedAt).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  });

  const lines: string[] = [
    `## QA 자동 점검 - 테스트 실패 리포트`,
    '',
    `| 항목 | 값 |`,
    `|------|-----|`,
    `| Run ID | \`${runId}\` |`,
    `| 실행 시각 | ${runTime} |`,
    `| Health Check | ${health.healthy ? 'OK' : 'FAIL'} |`,
    `| 테스트 결과 | ${test.passed} 통과 / **${test.failed} 실패** / ${test.skipped} 스킵 |`,
    `| 소요 시간 | ${Math.round(test.durationMs / 1000)}초 |`,
    '',
    '### 실패 테스트 목록',
    '',
  ];

  for (const failure of test.failures) {
    lines.push(`- \`${failure}\``);
  }

  lines.push('', '---', '_이 이슈는 Autonomous QA Agent에 의해 자동 생성되었습니다._');
  return lines.join('\n');
}

function buildServiceDownBody(
  runId: string,
  startedAt: string,
  health: HealthCheckResult,
): string {
  const runTime = new Date(startedAt).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  });

  const failedEndpoints = health.endpoints
    .filter((e) => !e.healthy)
    .map((e) => `- **${e.label}**: \`${e.url}\` ${e.error ? `(${e.error})` : ''}`)
    .join('\n');

  return [
    `## QA 자동 점검 - 서비스 미응답`,
    '',
    `| 항목 | 값 |`,
    `|------|-----|`,
    `| Run ID | \`${runId}\` |`,
    `| 실행 시각 | ${runTime} |`,
    '',
    '### 미응답 엔드포인트',
    '',
    failedEndpoints,
    '',
    '---',
    '_이 이슈는 Autonomous QA Agent에 의해 자동 생성되었습니다._',
  ].join('\n');
}

function buildCommentBody(
  runId: string,
  startedAt: string,
  health: HealthCheckResult,
  test?: TestRunResult,
): string {
  const runTime = new Date(startedAt).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  });

  const lines: string[] = [
    `### 재발생 리포트 (${runTime})`,
    '',
    `- **Run ID**: \`${runId}\``,
    `- **Health Check**: ${health.healthy ? 'OK' : 'FAIL'}`,
  ];

  if (test && test.executed) {
    lines.push(`- **테스트**: ${test.passed} 통과 / **${test.failed} 실패** / ${test.skipped} 스킵`);
    if (test.failures.length > 0) {
      lines.push('- **실패 목록**:');
      for (const f of test.failures) {
        lines.push(`  - \`${f}\``);
      }
    }
  } else if (!health.healthy) {
    const failedEndpoints = health.endpoints
      .filter((e) => !e.healthy)
      .map((e) => e.label);
    lines.push(`- **미응답**: ${failedEndpoints.join(', ')}`);
  }

  return lines.join('\n');
}

function withTempFile(body: string, fn: (filePath: string) => string): string {
  const tempPath = join(tmpdir(), `qa-issue-${Date.now()}.md`);
  writeFileSync(tempPath, body, 'utf-8');
  try {
    return fn(tempPath);
  } finally {
    try { unlinkSync(tempPath); } catch { /* ignore */ }
  }
}

function createIssue(repo: string, title: string, body: string): { url: string; number: number } | null {
  try {
    const output = withTempFile(body, (filePath) =>
      execSync(
        `gh issue create --repo ${repo} --title "${title}" --label qa-auto --body-file "${filePath}"`,
        { encoding: 'utf-8', timeout: 30000 },
      ),
    );
    const url = output.trim();
    const numberMatch = url.match(/\/issues\/(\d+)$/);
    return {
      url,
      number: numberMatch ? parseInt(numberMatch[1], 10) : 0,
    };
  } catch (err) {
    console.error(`[Issue] 이슈 생성 실패 (${repo}):`, err instanceof Error ? err.message : err);
    return null;
  }
}

function addComment(repo: string, issueNumber: number, body: string): boolean {
  try {
    withTempFile(body, (filePath) =>
      execSync(
        `gh issue comment ${issueNumber} --repo ${repo} --body-file "${filePath}"`,
        { encoding: 'utf-8', timeout: 15000 },
      ),
    );
    return true;
  } catch (err) {
    console.error(`[Issue] 코멘트 추가 실패 (${repo}#${issueNumber}):`, err instanceof Error ? err.message : err);
    return false;
  }
}

function reportForProject(
  projectName: string,
  runId: string,
  startedAt: string,
  health: HealthCheckResult,
  test?: TestRunResult,
): IssueReportResult {
  const repo = githubRepoMap[projectName];
  if (!repo) {
    return { projectName, action: 'skipped', error: 'GitHub 저장소 매핑 없음' };
  }

  const isTestFailure = test && test.executed && test.failed > 0;
  const isServiceDown = !health.healthy;

  if (!isTestFailure && !isServiceDown) {
    return { projectName, action: 'skipped' };
  }

  // 기존 open 이슈 확인
  const existing = findExistingIssue(repo);

  if (existing) {
    // 기존 이슈에 코멘트 추가
    const commentBody = buildCommentBody(runId, startedAt, health, test);
    const success = addComment(repo, existing.number, commentBody);
    return {
      projectName,
      action: success ? 'commented' : 'skipped',
      issueNumber: existing.number,
      issueUrl: `https://github.com/${repo}/issues/${existing.number}`,
      error: success ? undefined : '코멘트 추가 실패',
    };
  }

  // 새 이슈 생성
  let title: string;
  let body: string;

  if (isTestFailure && test) {
    title = `[QA-Auto] ${projectName} - 테스트 실패 ${test.failed}건`;
    body = buildTestFailureBody(runId, startedAt, health, test);
  } else {
    title = `[QA-Auto] ${projectName} - 서비스 미응답`;
    body = buildServiceDownBody(runId, startedAt, health);
  }

  const result = createIssue(repo, title, body);
  if (result) {
    return {
      projectName,
      action: 'created',
      issueUrl: result.url,
      issueNumber: result.number,
    };
  }

  return { projectName, action: 'skipped', error: '이슈 생성 실패' };
}

export async function reportFailuresToGitHub(
  runResult: SchedulerRunResult,
): Promise<IssueReportResult[]> {
  const results: IssueReportResult[] = [];

  const healthMap = new Map<string, HealthCheckResult>();
  for (const hr of runResult.healthResults) healthMap.set(hr.projectName, hr);

  const testMap = new Map<string, TestRunResult>();
  for (const tr of runResult.testResults) testMap.set(tr.projectName, tr);

  // 실패 프로젝트 수집
  const failedProjects = new Set<string>();

  for (const tr of runResult.testResults) {
    if (tr.executed && tr.failed > 0) failedProjects.add(tr.projectName);
  }
  for (const hr of runResult.healthResults) {
    if (!hr.healthy) failedProjects.add(hr.projectName);
  }

  if (failedProjects.size === 0) {
    console.log('[Issue] 실패 프로젝트 없음 - 이슈 등록 건너뜀');
    return results;
  }

  console.log(`[Issue] ${failedProjects.size}개 프로젝트 이슈 등록 시작...`);

  for (const projectName of failedProjects) {
    const health = healthMap.get(projectName);
    const test = testMap.get(projectName);

    if (!health) continue;

    const result = reportForProject(projectName, runResult.runId, runResult.startedAt, health, test);
    results.push(result);

    const icon = result.action === 'created' ? '+' : result.action === 'commented' ? '~' : '-';
    console.log(`  [${icon}] ${projectName}: ${result.action}${result.issueUrl ? ` (${result.issueUrl})` : ''}${result.error ? ` - ${result.error}` : ''}`);
  }

  return results;
}
