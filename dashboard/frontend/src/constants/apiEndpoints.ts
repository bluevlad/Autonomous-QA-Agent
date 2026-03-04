import type { ApiEndpoint } from '../types/api';

const BASE = 'http://localhost:9095';
const API_KEY = 'Bearer <YOUR_API_KEY>';

export const API_CATEGORIES = [
  'Health',
  'Ingest',
  'Runs',
  'Projects',
  'Search',
  'Maintenance',
] as const;

export const API_ENDPOINTS: ApiEndpoint[] = [
  // --- Health ---
  {
    id: 'health',
    method: 'GET',
    path: '/api/health',
    category: 'Health',
    description: 'Check API server status and database connectivity.',
    responseSchema: `{
  "status": "ok",
  "database": "connected"
}`,
    curlExample: `curl ${BASE}/api/health`,
    pythonExample: `import requests

resp = requests.get("${BASE}/api/health")
print(resp.json())`,
    jsExample: `const resp = await fetch("/api/health");
const data = await resp.json();
console.log(data);`,
  },

  // --- Ingest ---
  {
    id: 'ingest',
    method: 'POST',
    path: '/api/ingest',
    category: 'Ingest',
    description: 'Import a QA Agent run result into the database. Supports UPSERT — duplicate run_id will overwrite existing data. Requires API Key authentication.',
    auth: true,
    requestSchema: `{
  "runId": "20260303-2200",
  "startedAt": "2026-03-03T22:00:00+09:00",
  "finishedAt": "2026-03-03T22:05:00+09:00",
  "durationMs": 300000,
  "summary": {
    "totalProjects": 6,
    "healthyProjects": 5,
    "testedProjects": 6,
    "totalTests": 150,
    "totalPassed": 148,
    "totalFailed": 2,
    "totalSkipped": 0
  },
  "healthResults": [
    {
      "projectName": "hopenvision",
      "healthy": true,
      "checkedAt": "2026-03-03T22:00:05+09:00",
      "endpoints": [
        {
          "url": "http://localhost:4060/health",
          "label": "Frontend",
          "healthy": true,
          "statusCode": 200,
          "responseTimeMs": 45.3,
          "error": null
        }
      ]
    }
  ],
  "testResults": [
    {
      "projectName": "hopenvision",
      "executed": true,
      "skippedReason": null,
      "passed": 25,
      "failed": 1,
      "skipped": 0,
      "total": 26,
      "exitCode": 1,
      "durationMs": 12000,
      "failures": ["test_login > should redirect"]
    }
  ],
  "failureDetails": [
    {
      "testName": "should redirect after login",
      "suiteName": "Login Flow",
      "filePath": "projects/hopenvision/e2e/login.spec.ts",
      "errorMessage": "Expected 200, got 302",
      "category": "e2e"
    }
  ],
  "suggestions": [
    {
      "ruleId": "repeated-failure",
      "severity": "warning",
      "title": "hopenvision login 3회 연속 실패",
      "description": "최근 3회 실행에서 동일 테스트 실패",
      "projectName": "hopenvision"
    }
  ],
  "issueResults": [
    {
      "projectName": "hopenvision",
      "action": "created",
      "issueUrl": "https://github.com/bluevlad/hopenvision/issues/42",
      "issueNumber": 42,
      "error": null
    }
  ]
}`,
    responseSchema: `{
  "status": "ok",
  "runId": "20260303-2200",
  "dbId": 1
}`,
    curlExample: `curl -X POST ${BASE}/api/ingest \\
  -H "Content-Type: application/json" \\
  -H "Authorization: ${API_KEY}" \\
  -d '{
    "runId": "20260303-2200",
    "startedAt": "2026-03-03T22:00:00+09:00",
    "finishedAt": "2026-03-03T22:05:00+09:00",
    "durationMs": 300000,
    "summary": {
      "totalProjects": 1, "healthyProjects": 1,
      "testedProjects": 1, "totalTests": 10,
      "totalPassed": 10, "totalFailed": 0, "totalSkipped": 0
    },
    "healthResults": [],
    "testResults": []
  }'`,
    pythonExample: `import requests

payload = {
    "runId": "20260303-2200",
    "startedAt": "2026-03-03T22:00:00+09:00",
    "finishedAt": "2026-03-03T22:05:00+09:00",
    "durationMs": 300000,
    "summary": {
        "totalProjects": 1, "healthyProjects": 1,
        "testedProjects": 1, "totalTests": 10,
        "totalPassed": 10, "totalFailed": 0, "totalSkipped": 0
    },
    "healthResults": [],
    "testResults": []
}
resp = requests.post(
    "${BASE}/api/ingest",
    json=payload,
    headers={"Authorization": "${API_KEY}"}
)
print(resp.status_code, resp.json())`,
    jsExample: `const resp = await fetch("/api/ingest", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "${API_KEY}"
  },
  body: JSON.stringify({
    runId: "20260303-2200",
    startedAt: "2026-03-03T22:00:00+09:00",
    finishedAt: "2026-03-03T22:05:00+09:00",
    durationMs: 300000,
    summary: { totalProjects: 1, healthyProjects: 1, testedProjects: 1,
               totalTests: 10, totalPassed: 10, totalFailed: 0, totalSkipped: 0 },
    healthResults: [], testResults: []
  })
});
console.log(await resp.json());`,
  },

  // --- Runs ---
  {
    id: 'runs-list',
    method: 'GET',
    path: '/api/runs',
    category: 'Runs',
    description: 'List QA Agent run results with pagination and optional date filtering.',
    params: [
      { name: 'page', type: 'integer', required: false, description: 'Page number', defaultValue: '1' },
      { name: 'limit', type: 'integer', required: false, description: 'Items per page (1-100)', defaultValue: '20' },
      { name: 'date_from', type: 'string', required: false, description: 'Start date filter (ISO 8601)' },
      { name: 'date_to', type: 'string', required: false, description: 'End date filter (ISO 8601)' },
    ],
    responseSchema: `{
  "total": 42,
  "page": 1,
  "limit": 20,
  "runs": [
    {
      "id": 1,
      "run_id": "20260303-2200",
      "started_at": "2026-03-03T22:00:00+09:00",
      "finished_at": "2026-03-03T22:05:00+09:00",
      "duration_ms": 300000,
      "total_projects": 6,
      "healthy_projects": 5,
      "tested_projects": 6,
      "total_tests": 150,
      "total_passed": 148,
      "total_failed": 2,
      "total_skipped": 0
    }
  ]
}`,
    curlExample: `curl "${BASE}/api/runs?page=1&limit=10"`,
    pythonExample: `import requests

resp = requests.get("${BASE}/api/runs", params={"page": 1, "limit": 10})
data = resp.json()
for run in data["runs"]:
    print(run["run_id"], run["total_passed"], run["total_failed"])`,
    jsExample: `const resp = await fetch("/api/runs?page=1&limit=10");
const data = await resp.json();
data.runs.forEach(run => console.log(run.run_id));`,
  },
  {
    id: 'runs-detail',
    method: 'GET',
    path: '/api/runs/{run_id}',
    category: 'Runs',
    description: 'Get full detail for a specific run including health checks, test results, failure details, suggestions, and issue results.',
    params: [
      { name: 'run_id', type: 'string', required: true, description: 'Run ID (e.g. "20260303-2200")' },
    ],
    responseSchema: `{
  "id": 1,
  "runId": "20260303-2200",
  "startedAt": "2026-03-03T22:00:00+09:00",
  "finishedAt": "2026-03-03T22:05:00+09:00",
  "durationMs": 300000,
  "summary": { "totalProjects": 6, ... },
  "healthResults": [ { "project_name": "hopenvision", "healthy": true, "endpoints": [...] } ],
  "testResults": [ { "project_name": "hopenvision", "passed": 25, "failed": 1, ... } ],
  "failureDetails": [ { "test_name": "...", "error_message": "...", "category": "e2e" } ],
  "suggestions": [ { "rule_id": "...", "severity": "warning", "title": "..." } ],
  "issueResults": [ { "project_name": "...", "action": "created", "issue_url": "..." } ]
}`,
    curlExample: `curl ${BASE}/api/runs/20260303-2200`,
    pythonExample: `import requests

resp = requests.get("${BASE}/api/runs/20260303-2200")
run = resp.json()
s = run["summary"]
print(f"Passed: {s['totalPassed']}, Failed: {s['totalFailed']}")`,
    jsExample: `const resp = await fetch("/api/runs/20260303-2200");
const run = await resp.json();
console.log(run.summary);`,
  },
  {
    id: 'runs-delete',
    method: 'DELETE',
    path: '/api/runs/{run_id}',
    category: 'Runs',
    description: 'Delete a run and all related data (health results, test results, failure details, suggestions, issues) via CASCADE. Requires API Key authentication.',
    auth: true,
    params: [
      { name: 'run_id', type: 'string', required: true, description: 'Run ID to delete' },
    ],
    responseSchema: `{
  "status": "ok",
  "runId": "20260303-2200",
  "message": "Run and related data deleted"
}`,
    curlExample: `curl -X DELETE ${BASE}/api/runs/20260303-2200 \\
  -H "Authorization: ${API_KEY}"`,
    pythonExample: `import requests

resp = requests.delete(
    "${BASE}/api/runs/20260303-2200",
    headers={"Authorization": "${API_KEY}"}
)
print(resp.json())`,
    jsExample: `const resp = await fetch("/api/runs/20260303-2200", {
  method: "DELETE",
  headers: { "Authorization": "${API_KEY}" }
});
console.log(await resp.json());`,
  },

  // --- Projects ---
  {
    id: 'projects-list',
    method: 'GET',
    path: '/api/projects',
    category: 'Projects',
    description: 'List all projects with their latest health status and 30-day statistics.',
    responseSchema: `{
  "projects": [
    {
      "project_name": "hopenvision",
      "last_checked_at": "2026-03-03T22:00:05+09:00",
      "last_healthy": true,
      "total_runs": 30,
      "avg_pass_rate": 96.5,
      "recent_failures": 2
    }
  ]
}`,
    curlExample: `curl ${BASE}/api/projects`,
    pythonExample: `import requests

resp = requests.get("${BASE}/api/projects")
for p in resp.json()["projects"]:
    status = "UP" if p["last_healthy"] else "DOWN"
    print(f"{p['project_name']}: {status} ({p['avg_pass_rate']:.1f}%)")`,
    jsExample: `const resp = await fetch("/api/projects");
const { projects } = await resp.json();
projects.forEach(p => console.log(p.project_name, p.last_healthy));`,
  },
  {
    id: 'projects-timeline',
    method: 'GET',
    path: '/api/projects/{name}/timeline',
    category: 'Projects',
    description: 'Get daily health and test timeline for a specific project.',
    params: [
      { name: 'name', type: 'string', required: true, description: 'Project name' },
      { name: 'days', type: 'integer', required: false, description: 'Number of days (1-90)', defaultValue: '30' },
    ],
    responseSchema: `{
  "projectName": "hopenvision",
  "days": 30,
  "timeline": [
    {
      "date": "2026-03-03",
      "healthy": true,
      "passed": 25,
      "failed": 1,
      "total": 26,
      "responseTimeMs": 45.3
    }
  ]
}`,
    curlExample: `curl "${BASE}/api/projects/hopenvision/timeline?days=14"`,
    pythonExample: `import requests

resp = requests.get("${BASE}/api/projects/hopenvision/timeline", params={"days": 14})
data = resp.json()
for point in data["timeline"]:
    print(f"{point['date']}: {'UP' if point['healthy'] else 'DOWN'}")`,
    jsExample: `const resp = await fetch("/api/projects/hopenvision/timeline?days=14");
const { timeline } = await resp.json();
timeline.forEach(p => console.log(p.date, p.healthy));`,
  },

  // --- Search ---
  {
    id: 'search',
    method: 'GET',
    path: '/api/search',
    category: 'Search',
    description: 'Full-text search across failure details using PostgreSQL tsvector.',
    params: [
      { name: 'q', type: 'string', required: true, description: 'Search query' },
      { name: 'limit', type: 'integer', required: false, description: 'Max results (1-100)', defaultValue: '20' },
    ],
    responseSchema: `{
  "query": "login timeout",
  "total": 3,
  "results": [
    {
      "type": "failure",
      "id": 42,
      "runId": "20260303-2200",
      "text": "should redirect after login: Expected 200, got 302",
      "rank": 0.85
    }
  ]
}`,
    curlExample: `curl "${BASE}/api/search?q=login+timeout&limit=10"`,
    pythonExample: `import requests

resp = requests.get("${BASE}/api/search", params={"q": "login timeout", "limit": 10})
data = resp.json()
for r in data["results"]:
    print(f"[{r['runId']}] {r['text']}")`,
    jsExample: `const resp = await fetch("/api/search?q=login+timeout&limit=10");
const { results } = await resp.json();
results.forEach(r => console.log(r.runId, r.text));`,
  },

  // --- Maintenance ---
  {
    id: 'cleanup',
    method: 'POST',
    path: '/api/cleanup',
    category: 'Maintenance',
    description: 'Clean up old data based on retention policy. Deletes failure details and endpoint results older than the specified days, and clears raw_json. Requires API Key authentication.',
    auth: true,
    params: [
      { name: 'retention_days', type: 'integer', required: false, description: 'Days to retain (30-365)', defaultValue: '90' },
    ],
    responseSchema: `{
  "status": "ok",
  "retentionDays": 90,
  "deletedFailures": 120,
  "deletedEndpoints": 45,
  "clearedRawJson": 30
}`,
    curlExample: `curl -X POST "${BASE}/api/cleanup?retention_days=90" \\
  -H "Authorization: ${API_KEY}"`,
    pythonExample: `import requests

resp = requests.post(
    "${BASE}/api/cleanup",
    params={"retention_days": 90},
    headers={"Authorization": "${API_KEY}"}
)
print(resp.json())`,
    jsExample: `const resp = await fetch("/api/cleanup?retention_days=90", {
  method: "POST",
  headers: { "Authorization": "${API_KEY}" }
});
console.log(await resp.json());`,
  },
];
