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

interface ScoreHistogramProps {
  candidate: Candidate;
  candidateName?: string;
}

export function ScoreHistogram({ candidate, candidateName }: ScoreHistogramProps) {
  const distribution = candidate.metrics?.score_distribution;

  if (!distribution) {
    return (
      <div className="h-40 flex items-center justify-center text-text-muted text-sm">
        No score distribution data
      </div>
    );
  }

  // Convert distribution object to array format for recharts
  const data = Array.from({ length: 10 }, (_, i) => ({
    score: i + 1,
    count: distribution[i + 1] || 0,
  }));

  const totalVotes = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  const displayName = candidateName ?? candidate.kurdish_term?.word ?? "—";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[13px] font-semibold text-text-secondary" dir="rtl">
          {displayName}
        </h4>
        <span className="text-xs text-text-muted">{totalVotes} votes</span>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="score"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as (typeof data)[0];
                const percentage = totalVotes > 0 ? ((d.count / totalVotes) * 100).toFixed(1) : 0;
                return (
                  <div className="rounded-lg border border-border bg-surface-raised p-2 shadow-sm text-xs">
                    <p className="font-semibold">Score: {d.score}/10</p>
                    <p>Votes: {d.count}</p>
                    <p>{percentage}%</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {data.map((entry) => {
                // Color coding: 1-3 red, 4-6 yellow, 7-10 green
                let color = "#ef4444"; // red
                if (entry.score >= 7) color = "#22c55e"; // green
                else if (entry.score >= 4) color = "#eab308"; // yellow
                return <Cell key={entry.score} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mt-2 text-center">
        <div className="rounded bg-red-50 dark:bg-red-900/20 p-1.5">
          <p className="text-[10px] text-red-600 dark:text-red-400">Low (1-3)</p>
          <p className="text-xs font-semibold text-red-700 dark:text-red-300">
            {Object.entries(distribution).filter(([k]) => ["1", "2", "3"].includes(k)).reduce((s, [_, v]) => s + v, 0)}
          </p>
        </div>
        <div className="rounded bg-yellow-50 dark:bg-yellow-900/20 p-1.5">
          <p className="text-[10px] text-yellow-600 dark:text-yellow-400">Mid (4-6)</p>
          <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
            {Object.entries(distribution).filter(([k]) => ["4", "5", "6"].includes(k)).reduce((s, [_, v]) => s + v, 0)}
          </p>
        </div>
        <div className="rounded bg-green-50 dark:bg-green-900/20 p-1.5">
          <p className="text-[10px] text-green-600 dark:text-green-400">High (7-10)</p>
          <p className="text-xs font-semibold text-green-700 dark:text-green-300">
            {Object.entries(distribution).filter(([k]) => ["7", "8", "9", "10"].includes(k)).reduce((s, [_, v]) => s + v, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
