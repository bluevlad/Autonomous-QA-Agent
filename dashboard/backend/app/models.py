from datetime import datetime

from pydantic import BaseModel


# --- Ingest Request (QA Agent → Dashboard) ---

class EndpointCheckResult(BaseModel):
    url: str
    label: str
    healthy: bool
    statusCode: int | None = None
    responseTimeMs: float
    error: str | None = None


class HealthCheckResult(BaseModel):
    projectName: str
    healthy: bool
    endpoints: list[EndpointCheckResult]
    checkedAt: str


class TestRunResult(BaseModel):
    projectName: str
    executed: bool
    skippedReason: str | None = None
    passed: int
    failed: int
    skipped: int
    total: int
    exitCode: int
    durationMs: int
    failures: list[str] = []


class FailureDetail(BaseModel):
    testName: str
    suiteName: str | None = None
    filePath: str | None = None
    errorMessage: str | None = None
    category: str | None = None


class IssueReportResult(BaseModel):
    projectName: str
    action: str
    issueUrl: str | None = None
    issueNumber: int | None = None
    error: str | None = None


class Suggestion(BaseModel):
    ruleId: str
    severity: str = "info"
    title: str
    description: str | None = None
    projectName: str | None = None


class RunSummary(BaseModel):
    totalProjects: int
    healthyProjects: int
    testedProjects: int
    totalTests: int
    totalPassed: int
    totalFailed: int
    totalSkipped: int


class IngestRequest(BaseModel):
    runId: str
    startedAt: str
    finishedAt: str
    durationMs: int
    healthResults: list[HealthCheckResult]
    testResults: list[TestRunResult]
    issueResults: list[IssueReportResult] | None = None
    failureDetails: list[FailureDetail] | None = None
    suggestions: list[Suggestion] | None = None
    summary: RunSummary


# --- API Responses ---

class RunListItem(BaseModel):
    id: int
    runId: str
    startedAt: datetime
    finishedAt: datetime
    durationMs: int
    totalProjects: int
    healthyProjects: int
    totalTests: int
    totalPassed: int
    totalFailed: int


class RunDetailResponse(BaseModel):
    id: int
    runId: str
    startedAt: datetime
    finishedAt: datetime
    durationMs: int
    summary: RunSummary
    healthResults: list[dict]
    testResults: list[dict]
    failureDetails: list[dict]
    suggestions: list[dict]


class ProjectStatsItem(BaseModel):
    projectName: str
    lastCheckedAt: datetime | None
    lastHealthy: bool | None
    totalRuns: int
    avgPassRate: float | None
    recentFailures: int


class TimelinePoint(BaseModel):
    date: str
    healthy: bool
    passed: int
    failed: int
    total: int
    responseTimeMs: float | None


class SearchResult(BaseModel):
    type: str
    id: int
    runId: str | None = None
    text: str
    rank: float
