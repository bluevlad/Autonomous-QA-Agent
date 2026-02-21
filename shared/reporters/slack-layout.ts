/**
 * Slack QA 리포트 커스텀 레이아웃
 *
 * playwright-slack-report의 커스텀 레이아웃 함수.
 * 프로젝트별 테스트 결과를 구조화된 Block Kit 메시지로 변환합니다.
 */

interface TestResult {
  suiteName: string;
  name: string;
  status: string;
  retry: number;
  startedAt: string;
  endedAt: string;
  reason?: string;
  projectName?: string;
}

interface SummaryResults {
  passed: number;
  failed: number;
  flaky: number;
  skipped: number;
  failures: TestResult[];
  tests: TestResult[];
  meta?: { key: string; value: string }[];
}

function generateCustomLayout(summaryResults: SummaryResults) {
  const total = summaryResults.tests.length;
  const passed = summaryResults.passed;
  const failed = summaryResults.failed;
  const flaky = summaryResults.flaky;
  const skipped = summaryResults.skipped;

  // 전체 상태 이모지
  const statusEmoji = failed === 0 ? ':white_check_mark:' : ':x:';
  const statusText = failed === 0 ? '전체 통과' : `${failed}건 실패`;

  // 프로젝트별 결과 집계
  const projectResults = new Map<
    string,
    { passed: number; failed: number; total: number; failures: string[] }
  >();

  for (const test of summaryResults.tests) {
    const project = test.projectName || 'unknown';
    if (!projectResults.has(project)) {
      projectResults.set(project, {
        passed: 0,
        failed: 0,
        total: 0,
        failures: [],
      });
    }
    const pr = projectResults.get(project)!;
    pr.total++;
    if (test.status === 'passed') {
      pr.passed++;
    } else if (test.status === 'failed') {
      pr.failed++;
      pr.failures.push(test.name);
    }
  }

  // 프로젝트별 결과 블록 생성
  const projectBlocks: any[] = [];
  const projectOrder = [
    'hopenvision',
    'allergyinsight',
    'teacherhub',
    'standup',
    'healthpulse',
    'allergynewsletter',
    'academyinsight',
    'newsletterplatform',
    'unmong-main',
  ];

  for (const projectName of projectOrder) {
    const pr = projectResults.get(projectName);
    if (!pr) continue;

    const emoji = pr.failed === 0 ? ':white_check_mark:' : ':x:';
    let text = `${emoji} *${projectName}*  \`${pr.passed}/${pr.total}\` 통과`;
    if (pr.failed > 0) {
      text += `  |  :warning: ${pr.failed}건 실패`;
      const failList = pr.failures.slice(0, 3).map((f) => `    - ${f}`);
      if (pr.failures.length > 3) {
        failList.push(`    - ... 외 ${pr.failures.length - 3}건`);
      }
      text += '\n' + failList.join('\n');
    }

    projectBlocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text },
    });
  }

  // 등록되지 않은 프로젝트 (projectOrder에 없는 것들)
  for (const [projectName, pr] of projectResults) {
    if (projectOrder.includes(projectName)) continue;
    const emoji = pr.failed === 0 ? ':white_check_mark:' : ':x:';
    projectBlocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${emoji} *${projectName}*  \`${pr.passed}/${pr.total}\` 통과`,
      },
    });
  }

  // 메타 정보 블록
  const metaItems = summaryResults.meta || [];
  const metaText = metaItems.map((m) => `*${m.key}:* ${m.value}`).join('  |  ');

  // 최종 블록 조합
  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'QA Agent - 점검 결과 리포트',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${statusEmoji} *${statusText}*  |  총 \`${total}\`건  |  통과 \`${passed}\`  |  실패 \`${failed}\`  |  불안정 \`${flaky}\`  |  건너뜀 \`${skipped}\``,
      },
    },
    { type: 'divider' },
    ...projectBlocks,
    { type: 'divider' },
  ];

  if (metaText) {
    blocks.push({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: metaText }],
    });
  }

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `실행 시각: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}  |  Autonomous QA Agent`,
      },
    ],
  });

  return blocks;
}

export default generateCustomLayout;
