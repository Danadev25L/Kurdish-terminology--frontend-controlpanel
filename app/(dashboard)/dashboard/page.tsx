"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/lib/hooks/use-api";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConceptStatusBadge } from "@/components/domain/concept-status-badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import type { Concept, PaginatedResponse, Notification } from "@/lib/api/types";
import { timeAgo } from "@/lib/utils/format";

type Priority = "critical" | "urgent" | "high" | "normal" | "low";

const priorityOrder: Record<Priority, number> = {
  critical: 0,
  urgent: 1,
  high: 2,
  normal: 3,
  low: 4,
};

const priorityVariant: Record<Priority, "danger" | "warning" | "primary" | "default" | "default"> = {
  critical: "danger",
  urgent: "warning",
  high: "primary",
  normal: "default",
  low: "default",
};

interface InboxItem {
  id: number;
  english_term: string;
  domain_name: string;
  status: Concept["status"];
  priority: Priority;
  action: string;
  updated_at: string;
}

export default function DashboardPage() {
  const router = useRouter();

  // Use optimized inbox endpoint instead of loading all concepts
  const { data: concepts, isLoading: cLoading } = useApi<PaginatedResponse<Concept>>(
    "/api/v1/concepts/inbox",
    { pollingInterval: 120000 }
  );

  const { data: notifications, isLoading: nLoading } = useApi<Notification[]>(
    "/api/v1/notifications",
    { pollingInterval: 120000 }
  );

  // Build inbox items from concepts
  const inboxItems: InboxItem[] = (concepts?.data ?? [])
    .filter((c) => c.status !== "published")
    .map((c) => {
      let action = "Review";
      if (c.status === "draft") action = "Discussion open";
      if (c.status === "threshold") action = "Vote: Threshold";
      if (c.status === "voting") action = "Vote: Consensus";
      if (c.status === "review") action = "Board review";
      if (c.status === "recalled") action = "Reopened";

      return {
        id: c.id,
        english_term: c.english_term?.word ?? "Untitled",
        domain_name: c.domain?.name ?? "—",
        status: c.status,
        priority: c.priority,
        action,
        updated_at: c.updated_at,
      };
    })
    .sort(
      (a, b) =>
        priorityOrder[a.priority] - priorityOrder[b.priority] ||
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.read).length : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">Priority Inbox</h1>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card padding>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
              <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <div>
              <p className="text-[28px] font-extrabold tracking-[-0.02em] text-foreground">
                {inboxItems.length}
              </p>
              <p className="text-[11px] text-text-muted font-semibold uppercase tracking-[0.05em]">Active tasks</p>
            </div>
          </div>
        </Card>
        <Card padding>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-light">
              <svg className="h-5 w-5 text-danger" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-[28px] font-extrabold tracking-[-0.02em] text-foreground">
                {inboxItems.filter((i) => i.priority === "critical").length}
              </p>
              <p className="text-[11px] text-text-muted font-semibold uppercase tracking-[0.05em]">Critical</p>
            </div>
          </div>
        </Card>
        <Card padding>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-light">
              <svg className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <div>
              <p className="text-[28px] font-extrabold tracking-[-0.02em] text-foreground">{unreadCount}</p>
              <p className="text-[11px] text-text-muted font-semibold uppercase tracking-[0.05em]">Unread notifications</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Task list */}
      {cLoading || nLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : inboxItems.length > 0 ? (
        <div className="space-y-2">
          {inboxItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(`/concepts/${item.id}`)}
              className="w-full text-start cursor-pointer"
            >
              <Card className="transition-shadow hover:shadow-sm" padding={false}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <Badge variant={priorityVariant[item.priority]}>
                      {item.priority}
                    </Badge>
                    <div>
                      <p className="font-medium text-foreground">
                        {item.english_term}
                      </p>
                      <p className="text-[13px] text-text-muted">
                        {item.domain_name} &middot; {item.action}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ConceptStatusBadge status={item.status} />
                    <span className="text-xs text-text-muted">
                      {timeAgo(item.updated_at)}
                    </span>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          title="All caught up!"
          description="No pending tasks. Check back later for new items."
        />
      )}
    </div>
  );
}
