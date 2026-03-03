import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import type { RunListItem } from "../types";

export default function Runs() {
  const { data: runs, loading, error } = useApi<RunListItem[]>("/api/runs");

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Run History</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800 bg-gray-900/50">
              <th className="text-left px-4 py-3">Run ID</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Health</th>
              <th className="text-left px-4 py-3">Passed</th>
              <th className="text-left px-4 py-3">Failed</th>
              <th className="text-left px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Pass Rate</th>
              <th className="text-left px-4 py-3">Duration</th>
            </tr>
          </thead>
          <tbody>
            {runs?.map((run) => {
              const passRate =
                run.totalTests > 0
                  ? ((run.totalPassed / run.totalTests) * 100).toFixed(1)
                  : "-";
              return (
                <tr key={run.runId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <Link to={`/runs/${run.runId}`} className="text-blue-400 hover:underline">
                      {run.runId}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(run.startedAt).toLocaleString("ko-KR")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      run.healthyProjects === run.totalProjects
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}>
                      {run.healthyProjects}/{run.totalProjects}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-green-400">{run.totalPassed}</td>
                  <td className="px-4 py-3">
                    {run.totalFailed > 0 ? (
                      <span className="text-red-400">{run.totalFailed}</span>
                    ) : (
                      <span className="text-gray-600">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{run.totalTests}</td>
                  <td className="px-4 py-3">
                    <span className={
                      Number(passRate) === 100
                        ? "text-green-400"
                        : Number(passRate) >= 80
                        ? "text-yellow-400"
                        : "text-red-400"
                    }>
                      {passRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {(run.durationMs / 1000).toFixed(0)}s
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
