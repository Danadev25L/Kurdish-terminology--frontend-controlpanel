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
import type { DomainHealthData } from "@/lib/api/types";

interface DomainHealthChartProps {
  data: DomainHealthData[];
}

export function DomainHealthChart({ data }: DomainHealthChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="domain_name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as DomainHealthData;
              return (
                <div className="rounded-lg border border-border bg-surface-raised p-3 shadow-sm text-sm">
                  <p className="font-medium">{d.domain_name}</p>
                  <p>Finalized: {d.finalized_percentage.toFixed(1)}%</p>
                  <p>
                    {d.finalized_count} / {d.total_concepts} terms
                  </p>
                  <p>Avg Controversy: {d.avg_controversy.toFixed(2)}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="finalized_percentage" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
