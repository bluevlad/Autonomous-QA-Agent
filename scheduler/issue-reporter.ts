/**
 * QA 자동 점검 스케줄러 - GitHub Issues 자동 등록
 *
 * 테스트 실패 또는 서비스 다운 시 해당 프로젝트의 GitHub 저장소에 이슈를 자동 등록합니다.
 * - 중복 방지: 동일 프로젝트에 open 상태인 qa-auto 라벨 이슈가 있으면 코멘트로 추가
 * - 우선순위 자동 판정: P0~P3 기반 라벨 자동 부여
 * - WBS 매핑: 실패 테스트와 기능 요구사항 연결
 * - 자동 close: 복구된 프로젝트의 qa-auto 이슈 자동 종료
 * - 개선 제안 등록: improvement-advisor 결과를 이슈로 등록
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { githubRepoMap } from './config.js';
import { loadProjectWbs, findRelatedWbsItems } from './wbs-parser.js';
import type {
  SchedulerRunResult,
  HealthCheckResult,
  TestRunResult,
  IssueReportResult,
  PriorityLevel,
  FailureDetail,
  ImprovementSuggestion,
  ClosedIssueResult,
  WbsItem,
} from './types.js';

interface ExistingIssue {
  number: number;
  title: string;
}

const REQUIRED_LABELS: { name: string; color: string; description: string }[] = [
  { name: 'qa-auto', color: '0075ca', description: 'QA Agent 자동 생성 이슈' },
  { name: 'P0', color: 'b60205', description: '긴급 - 서비스 다운' },
  { name: 'P1', color: 'd93f0b', description: '높음 - 실패율 30% 이상' },
  { name: 'P2', color: 'fbca04', description: '보통 - 실패율 10~30%' },
  { name: 'P3', color: '0e8a16', description: '낮음 - 경미한 실패' },
  { name: 'security', color: 'e11d48', description: '보안 관련' },
  { name: 'api', color: '7c3aed', description: 'API 관련' },
  { name: 'e2e', color: '2563eb', description: 'E2E 테스트 관련' },
  { name: 'improvement', color: '06b6d4', description: '개선 제안' },
];

// --- 우선순위 판정 ---

export function determinePriority(
  health: HealthCheckResult,
  test?: TestRunResult,
): PriorityLevel {
  if (!health.healthy) return 'P0';

  if (test && test.executed && test.total > 0) {
    const failureRate = test.failed / test.total;
    if (failureRate >= 0.3) return 'P1';
    if (failureRate >= 0.1) return 'P2';
  }

  return 'P3';
}

function determineCategoryLabels(failureDetails?: FailureDetail[]): string[] {
  if (!failureDetails || failureDetails.length === 0) return [];

  const categories = new Set<string>();
  for (const detail of failureDetails) {
    if (detail.category) categories.add(detail.category);
  }

  // 'main' 카테고리는 'e2e'로 매핑
  const labels: string[] = [];
  for (const cat of categories) {
    if (cat === 'main') labels.push('e2e');
    else if (['security', 'api', 'e2e'].includes(cat)) labels.push(cat);
  }
  return [...new Set(labels)];
}

// --- 라벨 자동 생성 ---

export function ensureRequiredLabels(repo: string): void {
  for (const label of REQUIRED_LABELS) {
    try {
      execSync(
        `gh label create "${label.name}" --repo ${repo} --color "${label.color}" --description "${label.description}" --force`,
        { encoding: 'utf-8', timeout: 10000, stdio: 'pipe' },
      );
    } catch {
      // 이미 존재하거나 권한 없는 경우 무시
    }
  }
}

// --- 기존 이슈 검색 ---

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

function findExistingImprovementIssue(repo: string, title: string): ExistingIssue | null {
  try {
    const output = execSync(
      `gh issue list --repo ${repo} --label improvement --state open --json number,title --limit 50`,
      { encoding: 'utf-8', timeout: 15000 },
    );
    const issues = JSON.parse(output) as ExistingIssue[];
    return issues.find((i) => i.title === title) || null;
  } catch {
    return null;
  }
}

// --- 이슈 본문 빌드 ---

function buildTestFailureBody(
  runId: string,
  startedAt: string,
  health: HealthCheckResult,
  test: TestRunResult,
  priority: PriorityLevel,
  wbsItems: WbsItem[],
): string {
  const runTime = new Date(startedAt).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  });

  const failureRate = test.total > 0
    ? `${((test.failed / test.total) * 100).toFixed(1)}%`
    : 'N/A';

  const lines: string[] = [
    `## QA 자동 점검 - 테스트 실패 리포트`,
    '',
    `| 항목 | 값 |`,
    `|------|-----|`,
    `| Run ID | \`${runId}\` |`,
    `| 실행 시각 | ${runTime} |`,
    `| 우선순위 | **${priority}** |`,
    `| Health Check | ${health.healthy ? 'OK' : 'FAIL'} |`,
    `| 테스트 결과 | ${test.passed} 통과 / **${test.failed} 실패** / ${test.skipped} 스킵 |`,
    `| 실패율 | ${failureRate} |`,
    `| 소요 시간 | ${Math.round(test.durationMs / 1000)}초 |`,
    '',
  ];

  // WBS 매핑 정보
  if (wbsItems.length > 0) {
    lines.push('### 영향받는 기능 (WBS)', '');
    for (const item of wbsItems) {
      lines.push(`- **${item.id}** ${item.name}${item.owner ? ` (담당: ${item.owner})` : ''}`);
    }
    lines.push('');
  }

  // 실패 상세 정보
  lines.push('### 실패 테스트 상세', '');

  if (test.failureDetails && test.failureDetails.length > 0) {
    for (const detail of test.failureDetails) {
      lines.push(`#### ${detail.suiteName} > ${detail.testTitle}`);
      if (detail.filePath) lines.push(`- 파일: \`${detail.filePath}\``);
      if (detail.category) lines.push(`- 카테고리: \`${detail.category}\``);
      if (detail.durationMs != null) lines.push(`- 소요: ${detail.durationMs}ms`);
      if (detail.errorMessage) {
        lines.push('- 에러:', '```', detail.errorMessage, '```');
      }
      lines.push('');
    }
  } else {
    for (const failure of test.failures) {
      lines.push(`- \`${failure}\``);
    }
    lines.push('');
  }

  // QA-AGENT-META (Auto-Tobe-Agent 연동 대비)
  const meta = {
    runId,
    priority,
    projectName: test.projectName,
    failureCount: test.failed,
    totalCount: test.total,
    failureRate,
    wbsIds: wbsItems.map((i) => i.id),
    categories: [...new Set((test.failureDetails || []).map((d) => d.category).filter(Boolean))],
  };

  lines.push(
    '<details>',
    '<summary>QA-AGENT-META (자동 처리용)</summary>',
    '',
    '```json',
    JSON.stringify(meta, null, 2),
    '```',
    '</details>',
    '',
    '---',
    '_이 이슈는 Autonomous QA Agent에 의해 자동 생성되었습니다._',
  );

  return lines.join('\n');
}

function buildServiceDownBody(
  runId: string,
  startedAt: string,
  health: HealthCheckResult,
  priority: PriorityLevel,
): string {
  const runTime = new Date(startedAt).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  });

  const failedEndpoints = health.endpoints
    .filter((e) => !e.healthy)
    .map((e) => `- **${e.label}**: \`${e.url}\` ${e.error ? `(${e.error})` : ''}`)
    .join('\n');

  const meta = {
    runId,
    priority,
    projectName: health.projectName,
    serviceDown: true,
    failedEndpoints: health.endpoints.filter((e) => !e.healthy).map((e) => e.label),
  };

  return [
    `## QA 자동 점검 - 서비스 미응답`,
    '',
    `| 항목 | 값 |`,
    `|------|-----|`,
    `| Run ID | \`${runId}\` |`,
    `| 실행 시각 | ${runTime} |`,
    `| 우선순위 | **${priority}** |`,
    '',
    '### 미응답 엔드포인트',
    '',
    failedEndpoints,
    '',
    '<details>',
    '<summary>QA-AGENT-META (자동 처리용)</summary>',
    '',
    '```json',
    JSON.stringify(meta, null, 2),
    '```',
    '</details>',
    '',
    '---',
    '_이 이슈는 Autonomous QA Agent에 의해 자동 생성되었습니다._',
  ].join('\n');
}

function buildCommentBody(
  runId: string,
  startedAt: string,
  health: HealthCheckResult,
  priority: PriorityLevel,
  test?: TestRunResult,
): string {
  const runTime = new Date(startedAt).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  });

  const lines: string[] = [
    `### 재발생 리포트 (${runTime})`,
    '',
    `- **Run ID**: \`${runId}\``,
    `- **우선순위**: **${priority}**`,
    `- **Health Check**: ${health.healthy ? 'OK' : 'FAIL'}`,
  ];

  if (test && test.executed) {
    lines.push(`- **테스트**: ${test.passed} 통과 / **${test.failed} 실패** / ${test.skipped} 스킵`);
    if (test.failureDetails && test.failureDetails.length > 0) {
      lines.push('- **실패 상세**:');
      for (const d of test.failureDetails.slice(0, 5)) {
        lines.push(`  - \`${d.testTitle}\`${d.errorMessage ? ` - ${d.errorMessage.slice(0, 100)}` : ''}`);
      }
      if (test.failureDetails.length > 5) {
        lines.push(`  - ... 외 ${test.failureDetails.length - 5}건`);
      }
    } else if (test.failures.length > 0) {
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

// --- 파일 임시 저장 유틸리티 ---

function withTempFile(body: string, fn: (filePath: string) => string): string {
  const tempPath = join(tmpdir(), `qa-issue-${Date.now()}.md`);
  writeFileSync(tempPath, body, 'utf-8');
  try {
    return fn(tempPath);
  } finally {
    try { unlinkSync(tempPath); } catch { /* ignore */ }
  }
}

// --- 이슈 CRUD ---

function createIssue(
  repo: string,
  title: string,
  body: string,
  labels: string[],
): { url: string; number: number } | null {
  try {
    const labelArgs = labels.map((l) => `--label "${l}"`).join(' ');
    const output = withTempFile(body, (filePath) =>
      execSync(
        `gh issue create --repo ${repo} --title "${title}" ${labelArgs} --body-file "${filePath}"`,
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

// --- 프로젝트별 이슈 보고 ---

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

  const priority = determinePriority(health, test);

  // 라벨 생성 보장
  ensureRequiredLabels(repo);

  // 라벨 구성
  const labels = ['qa-auto', priority];
  if (isTestFailure && test?.failureDetails) {
    labels.push(...determineCategoryLabels(test.failureDetails));
  }
  if (isServiceDown) {
    // 서비스 다운은 별도 카테고리 라벨 없음
  }

  // 기존 open 이슈 확인
  const existing = findExistingIssue(repo);

  if (existing) {
    const commentBody = buildCommentBody(runId, startedAt, health, priority, test);
    const success = addComment(repo, existing.number, commentBody);
    return {
      projectName,
      action: success ? 'commented' : 'skipped',
      issueNumber: existing.number,
      issueUrl: `https://github.com/${repo}/issues/${existing.number}`,
      priority,
      labels,
      error: success ? undefined : '코멘트 추가 실패',
    };
  }

  // WBS 매핑
  let wbsItems: WbsItem[] = [];
  if (test?.failureDetails) {
    const wbs = loadProjectWbs(projectName);
    if (wbs) {
      wbsItems = findRelatedWbsItems(wbs, test.failureDetails);
    }
  }

  // 새 이슈 생성
  let title: string;
  let body: string;

  if (isTestFailure && test) {
    title = `[QA-Auto] ${projectName} - 테스트 실패 ${test.failed}건 (${priority})`;
    body = buildTestFailureBody(runId, startedAt, health, test, priority, wbsItems);
  } else {
    title = `[QA-Auto] ${projectName} - 서비스 미응답 (${priority})`;
    body = buildServiceDownBody(runId, startedAt, health, priority);
  }

  const result = createIssue(repo, title, body, labels);
  if (result) {
    return {
      projectName,
      action: 'created',
      issueUrl: result.url,
      issueNumber: result.number,
      priority,
      labels,
    };
  }

  return { projectName, action: 'skipped', error: '이슈 생성 실패' };
}

// --- 자동 close ---

export function closeResolvedIssues(
  runResult: SchedulerRunResult,
): ClosedIssueResult[] {
  const results: ClosedIssueResult[] = [];

  // 현재 실행에서 정상인 프로젝트 수집
  const healthyProjects = new Set<string>();
  for (const hr of runResult.healthResults) {
    if (hr.healthy) healthyProjects.add(hr.projectName);
  }

  // 테스트도 통과한 프로젝트만 대상
  for (const tr of runResult.testResults) {
    if (tr.executed && tr.failed > 0) {
      healthyProjects.delete(tr.projectName);
    }
  }

  for (const projectName of healthyProjects) {
    const repo = githubRepoMap[projectName];
    if (!repo) continue;

    const existing = findExistingIssue(repo);
    if (!existing) continue;

    try {
      // 1단계: 코멘트 추가
      const commentBody = [
        `### 자동 복구 확인`,
        '',
        `- **Run ID**: \`${runResult.runId}\``,
        `- **확인 시각**: ${new Date(runResult.startedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
        `- Health Check: OK`,
        `- 테스트: 전체 통과`,
        '',
        '_QA Agent가 서비스 복구를 감지하여 이슈를 자동으로 close합니다._',
      ].join('\n');

      addComment(repo, existing.number, commentBody);

      // 2단계: 이슈 close
      execSync(
        `gh issue close ${existing.number} --repo ${repo}`,
        { encoding: 'utf-8', timeout: 15000 },
      );

      const issueUrl = `https://github.com/${repo}/issues/${existing.number}`;
      results.push({
        projectName,
        issueNumber: existing.number,
        issueUrl,
        reason: '서비스 복구 + 테스트 통과',
      });

      console.log(`  [✓] ${projectName}: #${existing.number} 자동 close (${issueUrl})`);
    } catch (err) {
      console.error(`  [!] ${projectName}: #${existing.number} close 실패 -`, err instanceof Error ? err.message : err);
    }
  }

  return results;
}

// --- 개선 제안 이슈 등록 ---

export function reportSuggestionsToGitHub(
  suggestions: ImprovementSuggestion[],
  runId: string,
): IssueReportResult[] {
  const results: IssueReportResult[] = [];

  for (const suggestion of suggestions) {
    const repo = githubRepoMap[suggestion.projectName];
    if (!repo) continue;

    const title = `[QA-Improvement] ${suggestion.title}`;

    // 중복 방지
    const existing = findExistingImprovementIssue(repo, title);
    if (existing) {
      console.log(`  [~] ${suggestion.projectName}: "${title}" 이미 존재 (#${existing.number})`);
      results.push({
        projectName: suggestion.projectName,
        action: 'skipped',
        issueNumber: existing.number,
      });
      continue;
    }

    ensureRequiredLabels(repo);

    const body = [
      `## QA 개선 제안`,
      '',
      `| 항목 | 값 |`,
      `|------|-----|`,
      `| Run ID | \`${runId}\` |`,
      `| 유형 | ${suggestion.type} |`,
      `| 우선순위 | **${suggestion.priority}** |`,
      '',
      '### 설명',
      '',
      suggestion.description,
      '',
      '### 근거',
      '',
      suggestion.evidence,
      '',
      '---',
      '_이 이슈는 Autonomous QA Agent 개선 제안 엔진에 의해 자동 생성되었습니다._',
    ].join('\n');

    const labels = ['improvement', suggestion.priority];
    const result = createIssue(repo, title, body, labels);

    if (result) {
      results.push({
        projectName: suggestion.projectName,
        action: 'created',
        issueUrl: result.url,
        issueNumber: result.number,
        priority: suggestion.priority,
        labels,
      });
      console.log(`  [+] ${suggestion.projectName}: "${title}" 생성 (${result.url})`);
    } else {
      results.push({
        projectName: suggestion.projectName,
        action: 'skipped',
        error: '이슈 생성 실패',
      });
    }
  }

  return results;
}

// --- 메인 내보내기 ---

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
    console.log(`  [${icon}] ${projectName}: ${result.action} (${result.priority || 'N/A'})${result.issueUrl ? ` (${result.issueUrl})` : ''}${result.error ? ` - ${result.error}` : ''}`);
  }

  return results;
}
