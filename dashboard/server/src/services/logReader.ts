import fs from "fs";
import path from "path";
import type {
  DataSource,
  RunLog,
  RunListItem,
  TrendData,
  ProjectSummary,
  ProjectHistoryItem,
} from "./dataSource";

const LOGS_DIR =
  process.env.LOGS_DIR ||
  path.resolve(__dirname, "../../../../scheduler/logs");

function readAllLogs(): RunLog[] {
  if (!fs.existsSync(LOGS_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(LOGS_DIR)
    .filter((f) => f.startsWith("run-") && f.endsWith(".json"))
    .sort();

  return files.map((file) => {
    const content = fs.readFileSync(path.join(LOGS_DIR, file), "utf-8");
    return JSON.parse(content) as RunLog;
  });
}

export const fileDataSource: DataSource = {
  getRunList(): RunListItem[] {
    const logs = readAllLogs();
    return logs
      .map((log) => ({
        runId: log.runId,
        startedAt: log.startedAt,
        finishedAt: log.finishedAt,
        durationMs: log.durationMs,
        healthyProjects: log.summary.healthyProjects,
        totalProjects: log.summary.totalProjects,
        totalPassed: log.summary.totalPassed,
        totalFailed: log.summary.totalFailed,
        totalSkipped: log.summary.totalSkipped,
        totalTests: log.summary.totalTests,
      }))
      .reverse();
  },

  getRunById(runId: string): RunLog | null {
    const logs = readAllLogs();
    return logs.find((log) => log.runId === runId) ?? null;
  },

  getLatestRun(): RunLog | null {
    const logs = readAllLogs();
    return logs.length > 0 ? logs[logs.length - 1] : null;
  },

  getProjectsSummary(): ProjectSummary[] {
    const latest = this.getLatestRun();
    if (!latest) return [];

    return latest.healthChecks.map((hc) => {
      const testResult = latest.testResults.find(
        (tr) => tr.projectName === hc.projectName
      );
      return {
        name: hc.projectName,
        healthy: hc.healthy,
        lastChecked: hc.checkedAt,
        endpoints: hc.endpoints,
        lastTest: testResult
          ? {
              passed: testResult.passed,
              failed: testResult.failed,
              skipped: testResult.skipped,
              total: testResult.total,
              executed: testResult.executed,
              skippedReason: testResult.skippedReason,
              failures: testResult.failures,
            }
          : {
              passed: 0,
              failed: 0,
              skipped: 0,
              total: 0,
              executed: false,
              skippedReason: "No test data",
              failures: [],
            },
      };
    });
  },

  getProjectHistory(name: string): ProjectHistoryItem[] {
    const logs = readAllLogs();
    return logs.map((log) => {
      const hc = log.healthChecks.find((h) => h.projectName === name);
      const tr = log.testResults.find((t) => t.projectName === name);
      return {
        runId: log.runId,
        date: log.startedAt,
        healthy: hc?.healthy ?? null,
        endpoints: hc?.endpoints ?? [],
        test: tr
          ? {
              executed: tr.executed,
              passed: tr.passed,
              failed: tr.failed,
              skipped: tr.skipped,
              total: tr.total,
              durationMs: tr.durationMs,
              failures: tr.failures,
            }
          : null,
      };
    });
  },

  getTrends(): TrendData[] {
    const logs = readAllLogs();
    return logs.map((log) => {
      const passRate =
        log.summary.totalTests > 0
          ? Math.round(
              (log.summary.totalPassed / log.summary.totalTests) * 100 * 10
            ) / 10
          : 0;
      const healthRate =
        log.summary.totalProjects > 0
          ? Math.round(
              (log.summary.healthyProjects / log.summary.totalProjects) *
                100 *
                10
            ) / 10
          : 0;

      return {
        runId: log.runId,
        date: log.startedAt.split("T")[0],
        passRate,
        healthRate,
        totalTests: log.summary.totalTests,
        totalPassed: log.summary.totalPassed,
        totalFailed: log.summary.totalFailed,
      };
    });
  },
};
