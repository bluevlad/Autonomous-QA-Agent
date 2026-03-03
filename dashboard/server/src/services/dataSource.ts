export interface Endpoint {
  url: string;
  label: string;
  healthy: boolean;
  statusCode: number;
  responseTimeMs: number;
  error: string | null;
}

export interface HealthCheck {
  projectName: string;
  healthy: boolean;
  checkedAt: string;
  endpoints: Endpoint[];
}

export interface TestFailure {
  testName: string;
  error: string;
}

export interface TestResult {
  projectName: string;
  executed: boolean;
  skippedReason: string | null;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  exitCode: number;
  durationMs: number;
  failures: TestFailure[];
}

export interface IssueReport {
  projectName: string;
  action: string;
  issueUrl: string;
  issueNumber: number;
  error: string | null;
}

export interface RunSummary {
  totalProjects: number;
  healthyProjects: number;
  testedProjects: number;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalSkipped: number;
}

export interface RunLog {
  runId: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  healthChecks: HealthCheck[];
  testResults: TestResult[];
  issueReports: IssueReport[];
  summary: RunSummary;
}

export interface RunListItem {
  runId: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  healthyProjects: number;
  totalProjects: number;
  totalPassed: number;
  totalFailed: number;
  totalSkipped: number;
  totalTests: number;
}

export interface TrendData {
  runId: string;
  date: string;
  passRate: number;
  healthRate: number;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
}

export interface ProjectSummary {
  name: string;
  healthy: boolean;
  lastChecked: string;
  endpoints: Endpoint[];
  lastTest: {
    passed: number;
    failed: number;
    skipped: number;
    total: number;
    executed: boolean;
    skippedReason: string | null;
    failures: TestFailure[];
  };
}

export interface ProjectHistoryItem {
  runId: string;
  date: string;
  healthy: boolean | null;
  endpoints: Endpoint[];
  test: {
    executed: boolean;
    passed: number;
    failed: number;
    skipped: number;
    total: number;
    durationMs: number;
    failures: TestFailure[];
  } | null;
}

/** Abstract data source interface - implement for file or DB */
export interface DataSource {
  getRunList(): RunListItem[];
  getRunById(runId: string): RunLog | null;
  getLatestRun(): RunLog | null;
  getProjectsSummary(): ProjectSummary[];
  getProjectHistory(name: string): ProjectHistoryItem[];
  getTrends(): TrendData[];
}
