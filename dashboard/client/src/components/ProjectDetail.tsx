import { useParams, Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import type { ProjectHistory } from "../types";

export default function ProjectDetail() {
  const { name } = useParams<{ name: string }>();
  const { data, loading, error } = useApi<ProjectHistory[]>(`/api/projects/${name}`);

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;
  if (!data || data.length === 0) return <div className="text-gray-500">No data found</div>;

  const latest = data[data.length - 1];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/projects" className="text-gray-500 hover:text-gray-300">&larr; Back</Link>
        <h2 className="text-2xl font-bold text-white capitalize">{name}</h2>
        {latest.healthy !== null && (
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            latest.healthy ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
          }`}>
            {latest.healthy ? "Healthy" : "Unhealthy"}
          </span>
        )}
      </div>

      {latest.endpoints.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Endpoints</h3>
          <div className="space-y-2">
            {latest.endpoints.map((ep) => (
              <div key={ep.url} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${ep.healthy ? "bg-green-500" : "bg-red-500"}`} />
                  <span className="text-gray-300">{ep.label}</span>
                  <span className="text-gray-600 text-xs">{ep.url}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <span>{ep.statusCode}</span>
                  <span>{ep.responseTimeMs.toFixed(1)}ms</span>
                  {ep.error && <span className="text-red-400 text-xs">{ep.error}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Run History</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-2">Run</th>
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Health</th>
              <th className="text-left py-2">Passed</th>
              <th className="text-left py-2">Failed</th>
              <th className="text-left py-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            {[...data].reverse().map((h) => (
              <tr key={h.runId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="py-2">
                  <Link to={`/runs/${h.runId}`} className="text-blue-400 hover:underline">
                    {h.runId}
                  </Link>
                </td>
                <td className="py-2 text-gray-400">{h.date.split("T")[0]}</td>
                <td className="py-2">
                  {h.healthy === null ? (
                    <span className="text-gray-600">-</span>
                  ) : h.healthy ? (
                    <span className="text-green-400">OK</span>
                  ) : (
                    <span className="text-red-400">FAIL</span>
                  )}
                </td>
                <td className="py-2 text-green-400">{h.test?.passed ?? "-"}</td>
                <td className="py-2">
                  {h.test ? (
                    h.test.failed > 0 ? (
                      <span className="text-red-400">{h.test.failed}</span>
                    ) : (
                      <span className="text-gray-500">0</span>
                    )
                  ) : (
                    <span className="text-gray-600">-</span>
                  )}
                </td>
                <td className="py-2 text-gray-400">
                  {h.test ? `${(h.test.durationMs / 1000).toFixed(1)}s` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
