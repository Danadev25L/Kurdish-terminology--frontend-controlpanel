"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { DomainHeadRoleData } from "@/lib/api/types";

interface DomainHeadSectionProps {
  data: DomainHeadRoleData;
}

export function DomainHeadSection({ data }: DomainHeadSectionProps) {
  const router = useRouter();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Managed Domains Overview */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Domains I Manage</CardTitle>
        </CardHeader>
        <div className="p-4">
          {data.managed_domains.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.managed_domains.map((domain) => (
                <DomainStatCard
                  key={domain.id}
                  domain={domain}
                  onClick={() => router.push(`/domains/${domain.slug}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No managed domains"
              description="You haven't been assigned as a domain head yet"
            />
          )}
        </div>
      </Card>

      {/* Pending Concepts Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Review</CardTitle>
        </CardHeader>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-foreground">{data.pending_concepts}</p>
              <p className="text-sm text-text-muted">Concepts Awaiting Action</p>
            </div>
            <div className="h-14 w-14 rounded-lg bg-warning-light/20 flex items-center justify-center">
              <svg className="h-7 w-7 text-warning" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </div>

          {data.pending_concepts > 0 && (
            <button
              onClick={() => router.push("/concepts?status=review")}
              className="w-full mt-4 rounded-lg bg-warning px-4 py-2 text-sm font-semibold text-white hover:bg-warning/90 transition-colors"
            >
              Review Pending Concepts
            </button>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <div className="p-4 space-y-2">
          <button
            onClick={() => router.push("/concepts?status=draft")}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
          >
            <span className="text-sm font-medium">View Draft Concepts</span>
            <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button
            onClick={() => router.push("/concepts?status=threshold")}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
          >
            <span className="text-sm font-medium">Threshold Voting</span>
            <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button
            onClick={() => router.push("/domains")}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
          >
            <span className="text-sm font-medium">Manage Domains</span>
            <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </Card>
    </div>
  );
}

interface DomainStatCardProps {
  domain: {
    name: string;
    slug: string;
    pending_concepts: number;
    total_concepts: number;
  };
  onClick: () => void;
}

function DomainStatCard({ domain, onClick }: DomainStatCardProps) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all text-left"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-foreground">{domain.name}</h3>
        {domain.pending_concepts > 0 && (
          <Badge variant="warning" className="text-xs">
            {domain.pending_concepts} pending
          </Badge>
        )}
      </div>
      <p className="text-sm text-text-muted">
        {domain.total_concepts} total concepts
      </p>
    </button>
  );
}
