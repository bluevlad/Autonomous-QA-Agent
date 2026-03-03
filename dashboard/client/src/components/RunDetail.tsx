import { useParams, Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import type { RunLog } from "../types";

export default function RunDetail() {
  const { runId } = useParams<{ runId: string }>();
  const { data, loading, error } = useApi<RunLog>(`/api/runs/${runId}`);

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;
  if (!data) return <div className="text-gray-500">Run not found</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/runs" className="text-gray-500 hover:text-gray-300">&larr; Back</Link>
        <h2 className="text-2xl font-bold text-white">Run {data.runId}</h2>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500">Started</p>
          <p className="text-sm text-gray-200 mt-1">{new Date(data.startedAt).toLocaleString("ko-KR")}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500">Duration</p>
          <p className="text-sm text-gray-200 mt-1">{(data.durationMs / 1000).toFixed(0)}s</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500">Health</p>
          <p className="text-sm mt-1">
            <span className="text-green-400">{data.summary.healthyProjects}</span>
            <span className="text-gray-600"> / {data.summary.totalProjects}</span>
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500">Tests</p>
          <p className="text-sm mt-1">
            <span className="text-green-400">{data.summary.totalPassed}</span>
            {data.summary.totalFailed > 0 && (
              <span className="text-red-400"> / {data.summary.totalFailed} failed</span>
            )}
          </p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Health Checks</h3>
        <div className="space-y-3">
          {data.healthChecks.map((hc) => (
            <div key={hc.projectName} className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${hc.healthy ? "bg-green-500" : "bg-red-500"}`} />
                  <span className="text-gray-200 capitalize font-medium">{hc.projectName}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1 ml-4">
                  {hc.endpoints.map((ep) => (
                    <span key={ep.url} className="text-xs text-gray-500">
                      {ep.label}: {ep.statusCode} ({ep.responseTimeMs.toFixed(1)}ms)
                      {ep.error && <span className="text-red-400 ml-1">{ep.error}</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Test Results</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-2">Project</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Passed</th>
              <th className="text-left py-2">Failed</th>
              <th className="text-left py-2">Total</th>
              <th className="text-left py-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            {data.testResults.map((tr) => (
              <tr key={tr.projectName} className="border-b border-gray-800/50">
                <td className="py-2 capitalize text-gray-200">{tr.projectName}</td>
                <td className="py-2">
                  {tr.executed ? (
                    tr.failed > 0 ? (
                      <span className="text-red-400 text-xs bg-red-500/10 px-2 py-0.5 rounded-full">FAIL</span>
                    ) : (
                      <span className="text-green-400 text-xs bg-green-500/10 px-2 py-0.5 rounded-full">PASS</span>
                    )
                  ) : (
                    <span className="text-yellow-400 text-xs bg-yellow-500/10 px-2 py-0.5 rounded-full">SKIP</span>
                  )}
                </td>
                <td className="py-2 text-green-400">{tr.passed}</td>
                <td className="py-2">{tr.failed > 0 ? <span className="text-red-400">{tr.failed}</span> : <span className="text-gray-600">0</span>}</td>
                <td className="py-2 text-gray-400">{tr.total}</td>
                <td className="py-2 text-gray-400">{tr.executed ? `${(tr.durationMs / 1000).toFixed(1)}s` : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.testResults.some((tr) => tr.failures.length > 0) && (
        <div className="bg-gray-900 border border-red-900/30 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-red-400 mb-3">Failures</h3>
          <div className="space-y-2">
            {data.testResults
              .filter((tr) => tr.failures.length > 0)
              .flatMap((tr) =>
                tr.failures.map((f) => (
                  <div key={`${tr.projectName}-${f.testName}`} className="text-sm">
                    <span className="text-gray-400 capitalize">{tr.projectName}</span>
                    <span className="text-gray-600 mx-2">&rsaquo;</span>
                    <span className="text-gray-300">{f.testName}</span>
                    <p className="text-red-400/80 text-xs mt-0.5 ml-4">{f.error}</p>
                  </div>
                ))
              )}
          </div>
        </div>
      )}

      {data.issueReports.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Issue Reports</h3>
          <div className="space-y-2">
            {data.issueReports.map((ir) => (
              <div key={`${ir.projectName}-${ir.issueNumber}`} className="flex items-center gap-2 text-sm">
                <span className="capitalize text-gray-300">{ir.projectName}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  ir.action === "created" ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400"
                }`}>
                  {ir.action}
                </span>
                <a href={ir.issueUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-xs">
                  #{ir.issueNumber}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
