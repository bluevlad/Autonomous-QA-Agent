const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export interface RunListResponse {
  total: number;
  page: number;
  limit: number;
  runs: RunListItem[];
}

export interface RunListItem {
  id: number;
  run_id: string;
  started_at: string;
  finished_at: string;
  duration_ms: number;
  total_projects: number;
  healthy_projects: number;
  tested_projects: number;
  total_tests: number;
  total_passed: number;
  total_failed: number;
  total_skipped: number;
}

export interface RunDetail {
  id: number;
  runId: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  summary: {
    totalProjects: number;
    healthyProjects: number;
    testedProjects: number;
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    totalSkipped: number;
  };
  healthResults: HealthResult[];
  testResults: TestResult[];
  failureDetails: FailureDetail[];
  suggestions: Suggestion[];
}

export interface HealthResult {
  id: number;
  project_name: string;
  healthy: boolean;
  checked_at: string;
  endpoints: EndpointResult[];
}

export interface EndpointResult {
  url: string;
  label: string;
  healthy: boolean;
  statusCode?: number;
  responseTimeMs: number;
  error?: string;
}

export interface TestResult {
  id: number;
  project_name: string;
  executed: boolean;
  skipped_reason?: string;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  duration_ms: number;
}

export interface FailureDetail {
  id: number;
  test_name: string;
  suite_name?: string;
  file_path?: string;
  error_message?: string;
  category?: string;
}

export interface Suggestion {
  id: number;
  rule_id: string;
  severity: string;
  title: string;
  description?: string;
  project_name?: string;
}

export interface ProjectItem {
  project_name: string;
  last_checked_at: string | null;
  last_healthy: boolean | null;
  total_runs: number;
  avg_pass_rate: number | null;
  recent_failures: number;
}

export interface TimelinePoint {
  date: string;
  healthy: boolean;
  passed: number;
  failed: number;
  total: number;
  responseTimeMs: number | null;
}

export const api = {
  getRuns: (page = 1, limit = 20) =>
    fetchJSON<RunListResponse>(`/runs?page=${page}&limit=${limit}`),

  getRunDetail: (runId: string) =>
    fetchJSON<RunDetail>(`/runs/${runId}`),

  getProjects: () =>
    fetchJSON<{ projects: ProjectItem[] }>('/projects'),

  getProjectTimeline: (name: string, days = 30) =>
    fetchJSON<{ projectName: string; days: number; timeline: TimelinePoint[] }>(
      `/projects/${name}/timeline?days=${days}`
    ),

  search: (q: string) =>
    fetchJSON<{ query: string; total: number; results: unknown[] }>(`/search?q=${encodeURIComponent(q)}`),

  healthCheck: () =>
    fetchJSON<{ status: string; database: string }>('/health'),
};
