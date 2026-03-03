import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import type { ProjectSummary } from "../types";
import HealthStatusCard from "../components/HealthStatusCard";

export default function Projects() {
  const { data: projects, loading, error } = useApi<ProjectSummary[]>("/api/projects");
  const navigate = useNavigate();

  if (loading) return <div className="text-gray-500">Loading...</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Projects</h2>
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
  );
}
