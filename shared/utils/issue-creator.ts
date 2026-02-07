import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface IssueData {
  title: string;
  body: string;
  labels?: string[];
  repo: string; // format: owner/repo
}

export interface IssueResult {
  success: boolean;
  issueUrl?: string;
  error?: string;
}

/**
 * GitHub CLI를 사용하여 이슈를 생성합니다.
 */
export async function createGitHubIssue(issue: IssueData): Promise<IssueResult> {
  try {
    const labelsArg = issue.labels?.length
      ? `--label "${issue.labels.join(',')}"`
      : '';

    // Escape special characters in body
    const escapedBody = issue.body.replace(/"/g, '\\"').replace(/`/g, '\\`');

    const command = `gh issue create --repo ${issue.repo} --title "${issue.title}" --body "${escapedBody}" ${labelsArg}`;

    const { stdout } = await execAsync(command);
    const issueUrl = stdout.trim();

    return {
      success: true,
      issueUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 버그 이슈 템플릿
 */
export function createBugIssueBody(data: {
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  steps: string[];
  expected: string;
  actual: string;
  location?: string;
  suggestion?: string;
}): string {
  return `## 설명
${data.description}

## 심각도
**${data.severity}**

## 재현 단계
${data.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## 기대 동작
${data.expected}

## 실제 동작
${data.actual}
${data.location ? `\n## 관련 파일\n- ${data.location}` : ''}
${data.suggestion ? `\n## 제안 해결책\n${data.suggestion}` : ''}
`;
}

/**
 * 개선사항 이슈 템플릿
 */
export function createEnhancementIssueBody(data: {
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  currentBehavior?: string;
  proposedSolution: string;
  benefits?: string[];
  location?: string;
}): string {
  return `## 설명
${data.description}

## 우선순위
**${data.priority}**
${data.currentBehavior ? `\n## 현재 동작\n${data.currentBehavior}` : ''}

## 제안 개선안
${data.proposedSolution}
${data.benefits?.length ? `\n## 기대 효과\n${data.benefits.map((b) => `- ${b}`).join('\n')}` : ''}
${data.location ? `\n## 관련 파일\n- ${data.location}` : ''}
`;
}
