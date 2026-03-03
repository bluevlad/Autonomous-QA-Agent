/**
 * QA 자동 점검 스케줄러 - 개선 제안 엔진
 *
 * 과거 실행 로그를 분석하여 패턴 기반 개선 제안을 생성합니다.
 *
 * 5가지 분석 규칙:
 * 1. 반복 실패: 동일 테스트 3회+ 연속 실패
 * 2. 응답시간 저하: 최근 7일 vs 이전 7일 평균 30%+ 증가
 * 3. 커버리지 부족: 테스트 케이스 0건인 프로젝트
 * 4. 인프라 이상: 3일+ 연속 서비스 다운
 * 5. 실패율 추세: 3회+ 실행에서 실패율 지속 증가 (10%p+)
 */

import { getRecentLogs } from './logger.js';
import type {
  SchedulerRunResult,
  ImprovementSuggestion,
  PriorityLevel,
} from './types.js';

export function analyzeAndSuggest(): ImprovementSuggestion[] {
  const logs = getRecentLogs(30);
  if (logs.length === 0) return [];

  const suggestions: ImprovementSuggestion[] = [];

  suggestions.push(...detectRepeatedFailures(logs));
  suggestions.push(...detectResponseTimeDegradation(logs));
  suggestions.push(...detectCoverageGaps(logs));
  suggestions.push(...detectInfraIssues(logs));
  suggestions.push(...detectFailureRateTrend(logs));

  return suggestions;
}

// --- 규칙 1: 반복 실패 ---

function detectRepeatedFailures(logs: SchedulerRunResult[]): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];

  // 프로젝트별, 테스트별 연속 실패 횟수 추적
  const testFailStreaks = new Map<string, number>(); // "project::testTitle" → 연속 실패 수

  // 로그는 최신순 (getRecentLogs가 .reverse()하므로)이므로 오래된 것부터 처리
  const chronological = [...logs].reverse();

  for (const log of chronological) {
    for (const tr of log.testResults) {
      if (!tr.executed) continue;

      const failedTests = new Set<string>();
      if (tr.failureDetails) {
        for (const d of tr.failureDetails) {
          failedTests.add(d.testTitle);
        }
      } else {
        for (const f of tr.failures) {
          failedTests.add(f);
        }
      }

      // 이전에 추적 중인 테스트 업데이트
      for (const [key, count] of testFailStreaks) {
        if (!key.startsWith(`${tr.projectName}::`)) continue;
        const testTitle = key.slice(tr.projectName.length + 2);
        if (failedTests.has(testTitle)) {
          testFailStreaks.set(key, count + 1);
        } else {
          testFailStreaks.delete(key);
        }
      }

      // 새로 실패한 테스트 추가
      for (const testTitle of failedTests) {
        const key = `${tr.projectName}::${testTitle}`;
        if (!testFailStreaks.has(key)) {
          testFailStreaks.set(key, 1);
        }
      }
    }
  }

  // 3회+ 연속 실패 수집
  for (const [key, count] of testFailStreaks) {
    if (count < 3) continue;
    const [projectName, testTitle] = key.split('::');

    const priority: PriorityLevel = count >= 5 ? 'P1' : 'P2';

    suggestions.push({
      type: 'stability',
      projectName,
      title: `${projectName} - "${testTitle}" ${count}회 연속 실패`,
      description: `테스트 "${testTitle}"가 최근 ${count}회 연속 실패하고 있습니다. 근본 원인 분석이 필요합니다.`,
      evidence: `최근 ${logs.length}회 실행 중 ${count}회 연속 실패 감지`,
      priority,
    });
  }

  return suggestions;
}

// --- 규칙 2: 응답시간 저하 ---

function detectResponseTimeDegradation(logs: SchedulerRunResult[]): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];

  if (logs.length < 14) return suggestions; // 최소 14일 분량 필요

  const recent7 = logs.slice(0, 7);
  const previous7 = logs.slice(7, 14);

  // 프로젝트별 평균 응답시간 계산
  const projectNames = new Set<string>();
  for (const log of logs) {
    for (const hr of log.healthResults) {
      projectNames.add(hr.projectName);
    }
  }

  for (const projectName of projectNames) {
    const recentTimes = collectAvgResponseTimes(recent7, projectName);
    const previousTimes = collectAvgResponseTimes(previous7, projectName);

    if (recentTimes.length === 0 || previousTimes.length === 0) continue;

    const recentAvg = average(recentTimes);
    const previousAvg = average(previousTimes);

    if (previousAvg === 0) continue;

    const increaseRate = (recentAvg - previousAvg) / previousAvg;

    if (increaseRate >= 0.3) {
      const priority: PriorityLevel = increaseRate >= 0.5 ? 'P1' : 'P2';

      suggestions.push({
        type: 'performance',
        projectName,
        title: `${projectName} - 응답시간 ${Math.round(increaseRate * 100)}% 증가`,
        description: `최근 7일 평균 응답시간(${Math.round(recentAvg)}ms)이 이전 7일(${Math.round(previousAvg)}ms) 대비 ${Math.round(increaseRate * 100)}% 증가했습니다.`,
        evidence: `최근 7일 평균: ${Math.round(recentAvg)}ms, 이전 7일 평균: ${Math.round(previousAvg)}ms`,
        priority,
      });
    }
  }

  return suggestions;
}

function collectAvgResponseTimes(logs: SchedulerRunResult[], projectName: string): number[] {
  const times: number[] = [];
  for (const log of logs) {
    const hr = log.healthResults.find((h) => h.projectName === projectName);
    if (!hr || !hr.healthy) continue;

    const avgMs = hr.endpoints.reduce((sum, e) => sum + e.responseTimeMs, 0) / hr.endpoints.length;
    if (avgMs > 0) times.push(avgMs);
  }
  return times;
}

function average(arr: number[]): number {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

// --- 규칙 3: 커버리지 부족 ---

function detectCoverageGaps(logs: SchedulerRunResult[]): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];

  // 가장 최근 로그만 확인
  const latest = logs[0];
  if (!latest) return suggestions;

  for (const tr of latest.testResults) {
    if (tr.executed && tr.total === 0) {
      suggestions.push({
        type: 'coverage',
        projectName: tr.projectName,
        title: `${tr.projectName} - 테스트 케이스 없음`,
        description: `${tr.projectName} 프로젝트에 실행 가능한 테스트 케이스가 없습니다. 기본적인 E2E/API 테스트 작성이 필요합니다.`,
        evidence: `최근 실행 결과: 0건 테스트 케이스`,
        priority: 'P2',
      });
    }
  }

  return suggestions;
}

// --- 규칙 4: 인프라 이상 ---

function detectInfraIssues(logs: SchedulerRunResult[]): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];

  if (logs.length < 3) return suggestions;

  // 프로젝트별 연속 다운 횟수 (최신부터)
  const projectNames = new Set<string>();
  for (const log of logs) {
    for (const hr of log.healthResults) {
      projectNames.add(hr.projectName);
    }
  }

  for (const projectName of projectNames) {
    let consecutiveDown = 0;
    for (const log of logs) {
      const hr = log.healthResults.find((h) => h.projectName === projectName);
      if (hr && !hr.healthy) {
        consecutiveDown++;
      } else {
        break;
      }
    }

    if (consecutiveDown >= 3) {
      const priority: PriorityLevel = consecutiveDown >= 5 ? 'P0' : 'P1';

      suggestions.push({
        type: 'infrastructure',
        projectName,
        title: `${projectName} - ${consecutiveDown}일 연속 서비스 다운`,
        description: `${projectName} 서비스가 ${consecutiveDown}일 이상 연속으로 Health Check에 실패하고 있습니다. 인프라 점검이 필요합니다.`,
        evidence: `최근 ${consecutiveDown}회 연속 Health Check 실패`,
        priority,
      });
    }
  }

  return suggestions;
}

// --- 규칙 5: 실패율 추세 ---

function detectFailureRateTrend(logs: SchedulerRunResult[]): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];

  if (logs.length < 3) return suggestions;

  // 프로젝트별 실패율 추세 분석
  const projectNames = new Set<string>();
  for (const log of logs) {
    for (const tr of log.testResults) {
      if (tr.executed) projectNames.add(tr.projectName);
    }
  }

  for (const projectName of projectNames) {
    // 최근 순으로 실패율 수집
    const failureRates: number[] = [];
    for (const log of logs) {
      const tr = log.testResults.find((t) => t.projectName === projectName);
      if (tr && tr.executed && tr.total > 0) {
        failureRates.push(tr.failed / tr.total);
      }
    }

    if (failureRates.length < 3) continue;

    // 최근 3회 연속으로 실패율이 증가하는지 확인
    const recent3 = failureRates.slice(0, 3);
    const isIncreasing = recent3[0] > recent3[1] && recent3[1] > recent3[2];
    const totalIncrease = recent3[0] - recent3[2];

    if (isIncreasing && totalIncrease >= 0.1) {
      suggestions.push({
        type: 'stability',
        projectName,
        title: `${projectName} - 실패율 지속 증가 추세`,
        description: `${projectName}의 테스트 실패율이 최근 3회 실행에서 지속적으로 증가하고 있습니다 (${(recent3[2] * 100).toFixed(1)}% → ${(recent3[1] * 100).toFixed(1)}% → ${(recent3[0] * 100).toFixed(1)}%).`,
        evidence: `최근 3회 실패율: ${recent3.map((r) => `${(r * 100).toFixed(1)}%`).join(' → ')} (증가폭: ${(totalIncrease * 100).toFixed(1)}%p)`,
        priority: 'P2',
      });
    }
  }

  return suggestions;
}
