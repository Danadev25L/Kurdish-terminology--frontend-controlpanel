"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ScoreHistogramProps {
  /** Distribution data: array of { score: 1-10, count: number } */
  data: { score: number; count: number }[];
  candidateName?: string;
}

export function ScoreHistogram({ data, candidateName }: ScoreHistogramProps) {
  if (data.length === 0) return null;

  return (
    <div>
      {candidateName && (
        <h4 className="mb-2 text-[13px] font-semibold text-text-secondary" dir="rtl">
          {candidateName}
        </h4>
      )}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="score"
              tick={{ fontSize: 11 }}
              label={{ value: "Score", position: "bottom", fontSize: 11 }}
            />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 12 }}
              formatter={(value) => [value, "Votes"]}
            />
            <Bar dataKey="count" fill="#60a5fa" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
