"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConceptStatusBadge } from "@/components/domain/concept-status-badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useI18n } from "@/i18n/context";
import { getTwoFactorStatus } from "@/lib/api/auth";

type Priority = "critical" | "urgent" | "high" | "normal" | "low";

interface DashboardStats {
  total_concepts: number;
  published_concepts: number;
  draft_concepts: number;
  voting_concepts: number;
  review_concepts: number;
  this_week_concepts: number;
  this_week_published: number;
  total_domains: number;
  total_users: number;
  publication_rate: number;
}

interface ConceptByDomain {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface PublicationTrend {
  date: string;
  count: number;
}

interface StatusDistribution {
  status: string;
  count: number;
}

interface PriorityDistribution {
  priority: string;
  count: number;
}

interface ActivityItem {
  id: number;
  status: string;
  priority: Priority;
  updated_at: string;
  domain_name: string;
  english_term: string;
}

// Chart colors - darker/more visible colors
const COLORS = {
  primary: "#2563eb",     // darker blue
  success: "#16a34a",     // darker green
  warning: "#d97706",     // darker amber
  danger: "#dc2626",      // darker red
  info: "#7c3aed",        // darker purple
  published: "#16a34a",
  draft: "#4b5563",       // darker gray
  voting: "#2563eb",
  review: "#d97706",
  threshold: "#dc2626",
  recalled: "#7c3aed",
  critical: "#dc2626",
  urgent: "#d97706",
  high: "#2563eb",
  normal: "#4b5563",
  low: "#6b7280",
};

const STATUS_COLORS: Record<string, string> = {
  published: COLORS.published,
  draft: COLORS.draft,
  voting: COLORS.voting,
  review: COLORS.review,
  threshold: COLORS.threshold,
  recalled: COLORS.recalled,
};

const STATUS_LABELS: Record<string, string> = {
  published: "Published",
  draft: "Draft",
  voting: "Voting",
  review: "Review",
  threshold: "Threshold",
  recalled: "Recalled",
};

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [twoFactorStatus, setTwoFactorStatus] = useState<{
    enabled: boolean;
    confirmed: boolean;
    requires_mfa: boolean;
    setup_required: boolean;
  } | null>(null);

  useEffect(() => {
    getTwoFactorStatus()
      .then(setTwoFactorStatus)
      .catch(() => setTwoFactorStatus({ enabled: false, confirmed: false, requires_mfa: false, setup_required: false }));
  }, []);

  // Fetch all dashboard data
  const { data: stats, isLoading: statsLoading } = useApi<DashboardStats>("/api/v1/dashboard/stats");
  const { data: conceptsByDomain, isLoading: domainLoading } = useApi<ConceptByDomain[]>("/api/v1/dashboard/concepts-by-domain");
  const { data: publicationTrend, isLoading: trendLoading } = useApi<PublicationTrend[]>("/api/v1/dashboard/publication-trend");
  const { data: statusDistribution, isLoading: statusLoading } = useApi<StatusDistribution[]>("/api/v1/dashboard/status-distribution");
  const { data: priorityDistribution, isLoading: priorityLoading } = useApi<PriorityDistribution[]>("/api/v1/dashboard/priority-distribution");
  const { data: recentActivity, isLoading: activityLoading } = useApi<ActivityItem[]>("/api/v1/dashboard/recent-activity");

  // Transform status data for pie chart
  const statusData = statusDistribution?.map(s => ({
    name: STATUS_LABELS[s.status] || s.status,
    value: s.count,
    color: STATUS_COLORS[s.status] || COLORS.normal,
  })) || [];

  // Transform priority data
  const priorityData = priorityDistribution?.map(p => ({
    name: p.priority,
    value: p.count,
    color: COLORS[p.priority as keyof typeof COLORS] || COLORS.normal,
  })) || [];

  // Transform trend data to cumulative
  const trendData = publicationTrend?.map((item, index) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count: item.count,
    cumulative: publicationTrend.slice(0, index + 1).reduce((sum, i) => sum + i.count, 0),
  })) || [];

  const isLoading = statsLoading || domainLoading || trendLoading || statusLoading || priorityLoading || activityLoading;

  const hasError = !stats && !isLoading;

  if (isLoading && !stats) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">{t("dashboard.title")}</h1>

      {/* Debug: Show errors if any */}
      {(statsError || domainError) && (
        <div className="bg-danger/20 border border-danger/50 rounded-lg p-4 text-sm">
          <p className="font-semibold text-danger">API Error:</p>
          <p className="text-text-muted">{statsError || domainError}</p>
          <p className="text-xs mt-2">Make sure you're logged in and the backend is running on localhost:8000</p>
        </div>
      )}

      {/* 2FA Setup Banner */}
      {twoFactorStatus && !twoFactorStatus.enabled && (
        <div className="rounded-lg bg-warning-light/20 border border-warning/30 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-warning flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75M9 21h6a2.25 2.25 0 002.25-2.25V9.917c0-1.08-.61-2.067-1.562-2.551A9.963 9.963 0 008.25 9.75c-.96.484-1.562 1.471-1.562 2.551V18.75A2.25 2.25 0 009 21h6z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-warning">Two-Factor Authentication Not Enabled</p>
                <p className="text-xs text-text-muted">Secure your account by enabling 2FA</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/profile")}
              className="rounded-lg bg-warning px-3 py-1.5 text-xs font-semibold text-white hover:bg-warning/90 transition-colors"
            >
              Enable Now
            </button>
          </div>
        </div>
      )}

      {/* Stats Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
          value={stats?.total_concepts || 0}
          label="Total Concepts"
          color="primary"
          change={stats?.this_week_concepts ? `+${stats.this_week_concepts} this week` : undefined}
        />
        <StatCard
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          value={stats?.published_concepts || 0}
          label="Published"
          color="success"
          change={stats?.this_week_published ? `+${stats.this_week_published} this week` : undefined}
        />
        <StatCard
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.963 5.963m0 0a6.062 6.062 0 01-.941-3.197M7.5 10.5h.008v.008H7.5V10.5zm0-6h.008v.008H7.5V4.5z" />
            </svg>
          }
          value={stats?.voting_concepts || 0}
          label="In Voting"
          color="info"
        />
        <StatCard
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          value={stats?.review_concepts || 0}
          label="Pending Review"
          color="warning"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution - Simple colored boxes first */}
        <Card>
          <CardHeader>
            <CardTitle>Concept Status Distribution</CardTitle>
          </CardHeader>
          <div className="p-4 space-y-2">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.name}:</span>
                <span className="text-sm font-bold">{item.value}</span>
              </div>
            ))}
          </div>
          {/* Pie chart below */}
          <div className="h-48 px-4 border-t">
            {statusData.length > 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <PieChart width={200} height={180}>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${percent.toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted text-sm">
                No data
              </div>
            )}
          </div>
        </Card>

        {/* Concepts by Domain - Bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Concepts by Domain</CardTitle>
          </CardHeader>
          <div className="h-64 px-4">
            {conceptsByDomain && conceptsByDomain.length > 0 ? (
              <div className="w-full h-full flex items-center">
                <BarChart width={280} height={200} data={conceptsByDomain}>
                  <XAxis dataKey="name" tick={{fontSize: 10}} />
                  <YAxis tick={{fontSize: 10}} />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted text-sm">
                No data
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <div className="p-4 space-y-2">
            {priorityData.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div
                  className="w-32 h-6 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium capitalize">{item.name}:</span>
                <span className="text-sm font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <div className="p-4 space-y-2 text-sm">
            <p>• <strong>{stats?.total_concepts || 0}</strong> total concepts</p>
            <p>• <strong>{stats?.draft_concepts || 0}</strong> in draft</p>
            <p>• <strong>{stats?.published_concepts || 0}</strong> published</p>
            <p>• <strong>{stats?.total_domains || 0}</strong> domains</p>
            <p>• <strong>{stats?.total_users || 0}</strong> users</p>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <div className="divide-y">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(`/concepts/${item.id}`)}
                className="w-full text-start cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <Badge variant={item.priority === "critical" ? "danger" : item.priority === "urgent" ? "warning" : "default"}>
                      {item.priority}
                    </Badge>
                    <div>
                      <p className="font-medium text-foreground">
                        {item.english_term || "Untitled"}
                      </p>
                      <p className="text-[13px] text-text-muted">
                        {item.domain_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ConceptStatusBadge status={item.status as any} />
                    <span className="text-xs text-text-muted">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8">
              <EmptyState title="No recent activity" description="No concepts have been updated recently" />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: "primary" | "success" | "warning" | "info" | "danger";
  change?: string;
}

function StatCard({ icon, value, label, color, change }: StatCardProps) {
  const colorClasses = {
    primary: "bg-primary-light text-primary-500",
    success: "bg-success-light text-success-500",
    warning: "bg-warning-light text-warning-500",
    info: "bg-info-light text-info-500",
    danger: "bg-danger-light text-danger-500",
  };

  return (
    <Card padding>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
          <div>
            <p className="text-[28px] font-extrabold tracking-[-0.02em] text-foreground leading-none">
              {value}
            </p>
            <p className="text-[11px] text-text-muted font-semibold uppercase tracking-[0.05em] mt-1">
              {label}
            </p>
          </div>
        </div>
        {change && (
          <span className="text-xs font-medium text-success flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
            {change}
          </span>
        )}
      </div>
    </Card>
  );
}

// Area Chart Component
function AreaChartComp({ data }: { data: Array<{ date: string; count: number; cumulative: number }> }) {
  return (
    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
        </linearGradient>
      </defs>
      <XAxis
        dataKey="date"
        tick={{ fontSize: 11 }}
        stroke="#6b7280"
        tickFormatter={(value) => value}
      />
      <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <Tooltip
        contentStyle={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          fontSize: "12px",
        }}
      />
      <Area
        type="monotone"
        dataKey="count"
        stroke={COLORS.primary}
        fillOpacity={1}
        fill="url(#colorCount)"
        animationDuration={1000}
      />
    </AreaChart>
  );
}

// Pie Chart Component
function PieChartComp({ data }: { data: Array<{ name: string; value: number; color: string }> }) {
  return (
    <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
        animationDuration={1000}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          fontSize: "12px",
        }}
      />
    </PieChart>
  );
}

// Bar Chart Component
function BarChartComp({ data, horizontal = false }: { data: Array<{ name?: string; value?: number; count?: number }>; horizontal?: boolean }) {
  const chartData = data.map(d => ({
    name: d.name || String(d.value || ""),
    value: d.value || d.count || 0,
  }));

  return (
    <BarChart
      data={chartData}
      layout={horizontal ? "vertical" : "horizontal"}
      margin={{ top: 10, right: 10, left: horizontal ? 60 : 0, bottom: 0 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis
        dataKey="name"
        tick={{ fontSize: 11 }}
        stroke="#6b7280"
        angle={horizontal ? 0 : -45}
        textAnchor={horizontal ? "middle" : "end"}
        height={horizontal ? 20 : 60}
      />
      <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
      <Tooltip
        contentStyle={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          fontSize: "12px",
        }}
      />
      <Bar dataKey="value" fill={COLORS.primary} radius={[4, 4, 0, 0]} animationDuration={1000} />
    </BarChart>
  );
}
