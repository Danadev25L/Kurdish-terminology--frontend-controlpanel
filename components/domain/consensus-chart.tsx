"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Candidate } from "@/lib/api/types";

interface ConsensusChartProps {
  candidates: Candidate[];
  winnerId?: number;
}

export function ConsensusChart({ candidates, winnerId }: ConsensusChartProps) {
  const data = candidates
    .filter((c) => !c.withdrawn_at && c.metrics)
    .map((c) => ({
      name: c.kurdish_term?.word ?? "—",
      cs: c.metrics!.consensus_score,
      mean: c.metrics!.mean,
      stdDev: c.metrics!.std_dev,
      votes: c.metrics!.vote_count,
      isWinner: c.id === winnerId,
    }))
    .sort((a, b) => b.cs - a.cs);

  if (data.length === 0) return null;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as (typeof data)[0];
              return (
                <div className="rounded-lg border border-border bg-surface-raised p-3 shadow-sm text-[13px]">
                  <p className="font-semibold">{d.name}</p>
                  <p>Cs: {d.cs.toFixed(2)}</p>
                  <p>Mean: {d.mean.toFixed(2)}</p>
                  <p>Std Dev: {d.stdDev.toFixed(2)}</p>
                  <p>Votes: {d.votes}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="cs" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.isWinner ? "#16a34a" : "#3b82f6"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
