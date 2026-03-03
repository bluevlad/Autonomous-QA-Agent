import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import type { RunLog, TrendData, ProjectSummary } from "../types";
import TestSummaryCard from "../components/TestSummaryCard";
import HealthStatusCard from "../components/HealthStatusCard";
import TrendChart from "../components/TrendChart";

export default function Dashboard() {
  const { data: latest, loading: loadingLatest } = useApi<RunLog>("/api/runs/latest");
  const { data: trends, loading: loadingTrends } = useApi<TrendData[]>("/api/trends");
  const { data: projects, loading: loadingProjects } = useApi<ProjectSummary[]>("/api/projects");
  const navigate = useNavigate();

  if (loadingLatest || loadingTrends || loadingProjects) {
    return <div className="text-gray-500">Loading dashboard...</div>;
  }

  const summary = latest?.summary;
  const passRate = summary && summary.totalTests > 0
    ? ((summary.totalPassed / summary.totalTests) * 100).toFixed(1)
    : "0";

  const failures = latest?.testResults.flatMap((tr) =>
    tr.failures.map((f) => ({ project: tr.projectName, ...f }))
  ) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        {latest && (
          <span className="text-xs text-gray-500">
            Last run: {new Date(latest.startedAt).toLocaleString("ko-KR")}
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <TestSummaryCard label="Projects" value={summary?.totalProjects ?? 0} color="blue" />
        <TestSummaryCard
          label="Healthy"
          value={`${summary?.healthyProjects ?? 0} / ${summary?.totalProjects ?? 0}`}
          color="green"
        />
        <TestSummaryCard label="Total Tests" value={summary?.totalTests ?? 0} color="blue" />
        <TestSummaryCard
          label="Pass Rate"
          value={`${passRate}%`}
          sub={`${summary?.totalPassed ?? 0} passed, ${summary?.totalFailed ?? 0} failed`}
          color={Number(passRate) === 100 ? "green" : Number(passRate) >= 80 ? "yellow" : "red"}
        />
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Project Health
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {projects?.map((p) => (
            <HealthStatusCard
              key={p.name}
              project={p}
              onClick={() => navigate(`/projects/${p.name}`)}
            />
          ))}
        </div>
      </div>

      {failures.length > 0 && (
        <div className="bg-gray-900 border border-red-900/30 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-red-400 mb-3">Recent Test Failures</h3>
          <div className="space-y-2">
            {failures.map((f) => (
              <div key={`${f.project}-${f.testName}`} className="text-sm">
                <span className="text-gray-400 capitalize">{f.project}</span>
                <span className="text-gray-600 mx-2">&rsaquo;</span>
                <span className="text-gray-300">{f.testName}</span>
                <p className="text-red-400/80 text-xs mt-0.5 ml-4">{f.error}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <TrendChart data={trends ?? []} />
    </div>
  );
}
