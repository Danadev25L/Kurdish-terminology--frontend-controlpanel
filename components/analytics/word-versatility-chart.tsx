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
import type { WordVersatilityData } from "@/lib/api/types";

interface WordVersatilityChartProps {
  data: WordVersatilityData[];
}

export function WordVersatilityChart({ data }: WordVersatilityChartProps) {
  if (data.length === 0) return null;

  const sorted = [...data]
    .sort((a, b) => b.concept_count - a.concept_count)
    .slice(0, 15);

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 5, right: 20, bottom: 5, left: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
          <YAxis
            dataKey="kurdish_term"
            type="category"
            tick={{ fontSize: 12 }}
            width={80}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as WordVersatilityData;
              return (
                <div className="rounded-lg border border-border bg-surface-raised p-3 shadow-sm text-sm">
                  <p className="font-medium" dir="rtl">{d.kurdish_term}</p>
                  <p>Concepts: {d.concept_count}</p>
                  <p>Domains: {d.domains.join(", ")}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="concept_count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
