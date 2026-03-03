/**
 * QA 자동 점검 스케줄러 - 공통 타입 정의
 */

/** 이슈 우선순위 레벨 */
export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3';

/** 테스트 실패 상세 정보 */
export interface FailureDetail {
  testTitle: string;
  suiteName: string;
  filePath?: string;
  errorMessage?: string;
  durationMs?: number;
  category?: string;
}

/** 개선 제안 */
export interface ImprovementSuggestion {
  type: 'stability' | 'performance' | 'coverage' | 'infrastructure';
  projectName: string;
  title: string;
  description: string;
  evidence: string;
  priority: PriorityLevel;
}

/** WBS 기능 항목 */
export interface WbsItem {
  id: string;
  name: string;
  owner?: string;
  testFiles: string[];
  testCases?: string[];
}

/** WBS 설정 */
export interface WbsConfig {
  project: string;
  version?: string;
  features: WbsItem[];
}

/** 자동 close된 이슈 결과 */
export interface ClosedIssueResult {
  projectName: string;
  issueNumber: number;
  issueUrl: string;
  reason: string;
}

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
  failureDetails?: FailureDetail[];
}

/** GitHub Issues 등록 결과 */
export interface IssueReportResult {
  projectName: string;
  action: 'created' | 'commented' | 'skipped';
  issueUrl?: string;
  issueNumber?: number;
  error?: string;
  priority?: PriorityLevel;
  labels?: string[];
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
  suggestions?: ImprovementSuggestion[];
  closedIssues?: ClosedIssueResult[];
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
