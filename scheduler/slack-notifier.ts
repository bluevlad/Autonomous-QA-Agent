/**
 * QA 자동 점검 스케줄러 - Slack 알림
 *
 * 기존 slack-layout.ts의 Block Kit 패턴과 일관성 유지
 * header → section → divider → projects → suggestions → auto-close → context
 */

import { schedulerConfig } from './config.js';
import { determinePriority } from './issue-reporter.js';
import type {
  SchedulerRunResult,
  HealthCheckResult,
  TestRunResult,
  PriorityLevel,
} from './types.js';

const PRIORITY_EMOJI: Record<PriorityLevel, string> = {
  P0: ':rotating_light:',
  P1: ':red_circle:',
  P2: ':large_orange_circle:',
  P3: ':yellow_circle:',
};

function buildBlocks(result: SchedulerRunResult): object[] {
  const { summary, healthResults, testResults } = result;
  const allHealthy = summary.healthyProjects === summary.totalProjects;
  const allPassed = summary.totalFailed === 0;

  // 전체 상태
  let statusEmoji: string;
  let statusText: string;
  if (!allHealthy) {
    statusEmoji = ':warning:';
    statusText = `${summary.totalProjects - summary.healthyProjects}개 서비스 미응답`;
  } else if (!allPassed) {
    statusEmoji = ':x:';
    statusText = `${summary.totalFailed}건 테스트 실패`;
  } else {
    statusEmoji = ':white_check_mark:';
    statusText = '전체 정상';
  }

  const blocks: object[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'QA Agent - 자동 점검 리포트',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: [
          `${statusEmoji} *${statusText}*`,
          `서비스 \`${summary.healthyProjects}/${summary.totalProjects}\` 정상`,
          `테스트 \`${summary.totalPassed}/${summary.totalTests}\` 통과`,
          summary.totalFailed > 0 ? `실패 \`${summary.totalFailed}\`` : null,
          summary.totalSkipped > 0 ? `건너뜀 \`${summary.totalSkipped}\`` : null,
        ]
          .filter(Boolean)
          .join('  |  '),
      },
    },
    { type: 'divider' },
  ];

  // 프로젝트별 결과
  const healthMap = new Map<string, HealthCheckResult>();
  for (const hr of healthResults) healthMap.set(hr.projectName, hr);

  const testMap = new Map<string, TestRunResult>();
  for (const tr of testResults) testMap.set(tr.projectName, tr);

  const projectOrder = [
    'hopenvision', 'allergyinsight', 'edufit', 'standup',
    'newsletterplatform', 'unmong-main',
  ];

  for (const name of projectOrder) {
    const health = healthMap.get(name);
    const test = testMap.get(name);
    if (!health) continue;

    const lines: string[] = [];
    const priority = determinePriority(health, test);
    const priorityEmoji = PRIORITY_EMOJI[priority];

    // Health 상태 + 우선순위
    if (health.healthy) {
      const avgMs = Math.round(
        health.endpoints.reduce((sum, e) => sum + e.responseTimeMs, 0) /
          health.endpoints.length,
      );
      if (test && test.executed && test.failed > 0) {
        lines.push(`${priorityEmoji} *${name}* \`${priority}\`  |  응답 \`${avgMs}ms\``);
      } else {
        lines.push(`:white_check_mark: *${name}*  |  응답 \`${avgMs}ms\``);
      }
    } else {
      lines.push(`${priorityEmoji} *${name}* \`${priority}\`  |  미응답: ${health.endpoints.filter((e) => !e.healthy).map((e) => e.label).join(', ')}`);
    }

    // 테스트 결과
    if (test) {
      if (!test.executed) {
        lines.push(`    _테스트 건너뜀: ${test.skippedReason}_`);
      } else if (test.failed === 0) {
        lines.push(`    테스트 \`${test.passed}/${test.total}\` 통과`);
      } else {
        lines.push(`    테스트 \`${test.passed}/${test.total}\` 통과  |  :x: ${test.failed}건 실패`);
        const failNames = test.failures.slice(0, 3);
        for (const f of failNames) {
          lines.push(`    - ${f}`);
        }
        if (test.failures.length > 3) {
          lines.push(`    - ... 외 ${test.failures.length - 3}건`);
        }
      }
    }

    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: lines.join('\n') },
    });
  }

  blocks.push({ type: 'divider' });

  // 개선 제안 섹션
  if (result.suggestions && result.suggestions.length > 0) {
    const suggestionLines: string[] = [
      `:bulb: *개선 제안 ${result.suggestions.length}건*`,
      '',
    ];

    for (const s of result.suggestions.slice(0, 5)) {
      const emoji = PRIORITY_EMOJI[s.priority];
      suggestionLines.push(`${emoji} \`${s.priority}\` *${s.projectName}* - ${s.title}`);
    }

    if (result.suggestions.length > 5) {
      suggestionLines.push(`... 외 ${result.suggestions.length - 5}건`);
    }

    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: suggestionLines.join('\n') },
    });

    blocks.push({ type: 'divider' });
  }

  // 자동 close 정보
  if (result.closedIssues && result.closedIssues.length > 0) {
    const closeLines = result.closedIssues.map(
      (ci) => `:white_check_mark: 자동 close: *${ci.projectName}* <${ci.issueUrl}|#${ci.issueNumber}>`,
    );

    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: closeLines.join('\n') },
    });

    blocks.push({ type: 'divider' });
  }

  // Footer
  const durationSec = Math.round(result.durationMs / 1000);
  const runTime = new Date(result.startedAt).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  });

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `실행 시각: ${runTime}  |  소요 시간: ${durationSec}초  |  Autonomous QA Agent (${process.env.GITHUB_ACTIONS ? 'GitHub Actions' : 'Local'})`,
      },
    ],
  });

  return blocks;
}

export async function sendSlackNotification(
  result: SchedulerRunResult,
): Promise<boolean> {
  const webhookUrl = schedulerConfig.slackWebhookUrl;
  if (!webhookUrl) {
    console.log('[Slack] SLACK_WEBHOOK_URL 미설정 - 알림 건너뜀');
    return false;
  }

  const blocks = buildBlocks(result);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    });

    if (!response.ok) {
      console.error(`[Slack] 알림 전송 실패: ${response.status} ${response.statusText}`);
      return false;
    }

    console.log('[Slack] 알림 전송 완료');
    return true;
  } catch (err) {
    console.error('[Slack] 알림 전송 오류:', err instanceof Error ? err.message : err);
    return false;
  }
}
