"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MyDashboardData } from "@/lib/api/types";

interface UserProfileCardProps {
  data: MyDashboardData;
}

const ROLE_COLORS: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  admin: "danger",
  main_board: "warning",
  domain_head: "primary",
  expert: "success",
  observer: "default",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  main_board: "Board Member",
  domain_head: "Domain Head",
  expert: "Expert",
  observer: "Observer",
};

export function UserProfileCard({ data }: UserProfileCardProps) {
  const { user, my_domains, my_stats } = data;

  return (
    <Card padding>
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Avatar Section */}
        <div className="flex-shrink-0">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
            <div>
              <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
              <p className="text-sm text-text-muted">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <Badge key={role} variant={ROLE_COLORS[role] || "default"}>
                  {ROLE_LABELS[role] || role}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <StatItem
              label="Concepts"
              value={my_stats.concepts_contributed}
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              }
            />
            <StatItem
              label="Votes"
              value={my_stats.votes_cast}
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m3 3.75h-6a5.25 5.25 0 01-5.25-5.25V4.5" />
                </svg>
              }
            />
            <StatItem
              label="Discussions"
              value={my_stats.discussions_posted}
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3.75h9m-9 3.75h9m-9 3.75h9m1.5-12H5.25A2.25 2.25 0 003 6.75v10.5A2.25 2.25 0 005.25 19.5h13.5A2.25 2.25 0 0021 17.25V6.75A2.25 2.25 0 0018.75 4.5z" />
                </svg>
              }
            />
            <StatItem
              label="Proposals"
              value={my_stats.candidates_proposed}
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              }
            />
          </div>

          {/* My Domains */}
          {my_domains.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                My Domains
              </p>
              <div className="flex flex-wrap gap-2">
                {my_domains.map((domain) => (
                  <DomainBadge key={domain.id} domain={domain} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

interface StatItemProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

function StatItem({ label, value, icon }: StatItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-foreground leading-none">{value}</p>
        <p className="text-[10px] uppercase tracking-wide text-text-muted">{label}</p>
      </div>
    </div>
  );
}

interface DomainBadgeProps {
  domain: {
    name: string;
    slug: string;
    role: string;
    concepts_count: number;
  };
}

function DomainBadge({ domain }: DomainBadgeProps) {
  return (
    <a
      href={`/domains/${domain.slug}`}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/70 transition-colors"
    >
      <span className="text-sm font-medium text-foreground">{domain.name}</span>
      <span className="text-xs text-text-muted">({domain.concepts_count})</span>
      <span className="text-[10px] uppercase tracking-wider text-primary">{domain.role}</span>
    </a>
  );
}
