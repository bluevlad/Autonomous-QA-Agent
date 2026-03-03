import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TrendData } from "../types";

interface Props {
  data: TrendData[];
}

export default function TrendChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center text-gray-500">
        No trend data available
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Test Pass Rate Trend</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
          <YAxis domain={[0, 100]} stroke="#6B7280" fontSize={12} unit="%" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#F3F4F6",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="passRate"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ r: 4, fill: "#3B82F6" }}
            name="Pass Rate %"
          />
          <Line
            type="monotone"
            dataKey="healthRate"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ r: 4, fill: "#10B981" }}
            name="Health Rate %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
