import type { ProjectSummary } from "../types";

interface Props {
  project: ProjectSummary;
  onClick?: () => void;
}

export default function HealthStatusCard({ project, onClick }: Props) {
  const passRate =
    project.lastTest.total > 0
      ? Math.round((project.lastTest.passed / project.lastTest.total) * 100)
      : null;

  return (
    <div
      onClick={onClick}
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white capitalize">{project.name}</h3>
        <span
          className={`w-3 h-3 rounded-full ${
            project.healthy ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-400">
          <span>Health</span>
          <span className={project.healthy ? "text-green-400" : "text-red-400"}>
            {project.healthy ? "Healthy" : "Unhealthy"}
          </span>
        </div>

        <div className="flex justify-between text-gray-400">
          <span>Tests</span>
          {project.lastTest.executed ? (
            <span>
              <span className="text-green-400">{project.lastTest.passed}</span>
              {project.lastTest.failed > 0 && (
                <>
                  {" / "}
                  <span className="text-red-400">{project.lastTest.failed} failed</span>
                </>
              )}
            </span>
          ) : (
            <span className="text-yellow-400">Skipped</span>
          )}
        </div>

        {passRate !== null && (
          <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
            <div
              className={`h-1.5 rounded-full ${
                passRate === 100 ? "bg-green-500" : passRate >= 80 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${passRate}%` }}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-1 mt-2">
          {project.endpoints.map((ep) => (
            <span
              key={ep.url}
              className={`text-xs px-2 py-0.5 rounded-full ${
                ep.healthy
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {ep.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
