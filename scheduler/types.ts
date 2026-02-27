/**
 * QA 자동 점검 스케줄러 - 공통 타입 정의
 */

/** Health Check 검증 전략 */
export type HealthCheckStrategy = 'status-ok' | 'json-health' | 'page-load';

/** 프로젝트별 Health Check URL 설정 */
export interface HealthCheckEndpoint {
  url: string;
  label: string;
  strategy: HealthCheckStrategy;
}

export interface ProjectHealthConfig {
  name: string;
  playwrightProject: string;
  description: string;
  endpoints: HealthCheckEndpoint[];
}

/** 단일 엔드포인트 Health Check 결과 */
export interface EndpointCheckResult {
  url: string;
  label: string;
  healthy: boolean;
  statusCode?: number;
  responseTimeMs: number;
  error?: string;
}

/** 프로젝트 전체 Health Check 결과 */
export interface HealthCheckResult {
  projectName: string;
  healthy: boolean;
  endpoints: EndpointCheckResult[];
  checkedAt: string;
}

/** Playwright 테스트 실행 결과 */
export interface TestRunResult {
  projectName: string;
  executed: boolean;
  skippedReason?: string;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  exitCode: number;
  durationMs: number;
  failures: string[];
}

/** GitHub Issues 등록 결과 */
export interface IssueReportResult {
  projectName: string;
  action: 'created' | 'commented' | 'skipped';
  issueUrl?: string;
  issueNumber?: number;
  error?: string;
}

/** 전체 실행 결과 */
export interface SchedulerRunResult {
  runId: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  healthResults: HealthCheckResult[];
  testResults: TestRunResult[];
  issueResults?: IssueReportResult[];
  summary: {
    totalProjects: number;
    healthyProjects: number;
    testedProjects: number;
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    totalSkipped: number;
  };
}
