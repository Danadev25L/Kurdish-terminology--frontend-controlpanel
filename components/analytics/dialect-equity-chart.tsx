"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DialectEquityData } from "@/lib/api/types";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

interface DialectEquityChartProps {
  data: DialectEquityData[];
}

export function DialectEquityChart({ data }: DialectEquityChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="dialect"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, value }) =>
              `${name} (${value})`
            }
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as DialectEquityData;
              return (
                <div className="rounded-lg border border-border bg-surface-raised p-3 shadow-sm text-sm">
                  <p className="font-medium">{d.dialect}</p>
                  <p>Count: {d.count}</p>
                  <p>Share: {(d.percentage * 100).toFixed(1)}%</p>
                </div>
              );
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
