"use client";

import { useApi } from "@/lib/hooks/use-api";
import { RoleGate } from "@/components/auth/role-gate";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getMyContributions } from "@/lib/api/analytics";
import type { ExpertAnalytics } from "@/lib/api/analytics";
import { useI18n } from "@/i18n/context";
import { TrendingUp, Target, Award, Activity } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format";

export default function ExpertAnalyticsPage() {
  const { t } = useI18n();

  const { data: analytics, isLoading } = useApi<ExpertAnalytics>(
    "/api/v1/analytics/my-contributions"
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const alignmentRate = analytics?.alignment_rate ?? 0;
  const totalVotes = analytics?.total_votes ?? 0;
  const alignedVotes = analytics?.aligned_votes ?? 0;

  return (
    <RoleGate roles={["admin", "main_board", "domain_head", "expert"]}>
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: t("nav.dashboard"), href: "/dashboard" },
            { label: t("analytics_page.my_analytics") },
          ]}
        />

        <div>
          <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">
            {t("analytics_page.title")}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {t("analytics_page.subtitle")}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Activity className="h-5 w-5" />}
            label={t("analytics_page.total_votes")}
            value={totalVotes.toString()}
            color="blue"
          />
          <StatCard
            icon={<Target className="h-5 w-5" />}
            label={t("analytics_page.aligned_votes")}
            value={alignedVotes.toString()}
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label={t("analytics_page.alignment_rate")}
            value={`${alignmentRate.toFixed(1)}%`}
            color={alignmentRate >= 70 ? "green" : alignmentRate >= 50 ? "yellow" : "red"}
          />
          <StatCard
            icon={<Award className="h-5 w-5" />}
            label={t("analytics_page.active_domains")}
            value={(analytics?.by_domain?.length ?? 0).toString()}
            color="purple"
          />
        </div>

        {/* Domain Breakdown */}
        {analytics?.by_domain && analytics.by_domain.length > 0 && (
          <Card>
            <h3 className="mb-4 text-sm font-bold text-foreground">{t("analytics_page.performance_by_domain")}</h3>
            <div className="space-y-3">
              {analytics.by_domain.map((domain) => {
                const rate = domain.total_votes > 0
                  ? (domain.aligned_votes / domain.total_votes) * 100
                  : 0;
                return (
                  <div key={domain.domain_name} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {domain.domain_name}
                        </span>
                        <span className="text-xs text-text-muted">
                          {domain.aligned_votes}/{domain.total_votes} {t("board.votes").toLowerCase()}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-surface overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            rate >= 70
                              ? "bg-green-500"
                              : rate >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground w-12 text-right">
                      {rate.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Contribution History */}
        <Card>
          <h3 className="mb-4 text-sm font-bold text-foreground">{t("analytics_page.recent_contributions")}</h3>
          {analytics?.contributions && analytics.contributions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-light text-start text-[11px] font-semibold uppercase tracking-[0.05em] text-text-muted">
                    <th className="px-4 py-3">{t("concepts.title")}</th>
                    <th className="px-4 py-3">{t("concepts.domain")}</th>
                    <th className="px-4 py-3">{t("common.status")}</th>
                    <th className="px-4 py-3">{t("analytics_page.voted")}</th>
                    <th className="px-4 py-3">{t("analytics_page.aligned")}</th>
                    <th className="px-4 py-3">{t("admin.audit.date")}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.contributions.slice(0, 20).map((contribution) => (
                    <tr
                      key={contribution.concept_id}
                      className="border-b border-border-light hover:bg-surface transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/concepts/${contribution.concept_id}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                        >
                          {contribution.concept_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">
                        {contribution.domain_name}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                            contribution.status === "published"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : contribution.status === "recalled"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                          }`}
                        >
                          {contribution.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {contribution.voted ? (
                          <span className="text-green-600 dark:text-green-400">✓</span>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {contribution.vote_aligned === null ? (
                          <span className="text-text-muted">—</span>
                        ) : contribution.vote_aligned ? (
                          <span className="text-green-600 dark:text-green-400">✓</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400">✗</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">
                        {contribution.voted_at
                          ? formatDate(contribution.voted_at)
                          : contribution.published_at
                          ? formatDate(contribution.published_at)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-text-muted">
              {t("analytics_page.no_data")}
            </p>
          )}
        </Card>

        {/* Tips */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                {t("analytics_page.tips_title")}
              </h4>
              <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                {t("analytics_page.tips_message")}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </RoleGate>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "blue" | "green" | "yellow" | "red" | "purple";
}

const colorClasses = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
};

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <div>
          <p className="text-xs text-text-muted">{label}</p>
          <p className="text-lg font-bold text-foreground">{value}</p>
        </div>
      </div>
    </Card>
  );
}
