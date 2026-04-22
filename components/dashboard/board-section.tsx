"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ConceptStatusBadge } from "@/components/domain/concept-status-badge";

interface BoardSectionProps {
  data: {
    review_queue_count: number;
    recent_approvals: Array<{
      id: number;
      updated_at: string;
    }>;
  };
}

export function BoardSection({ data }: BoardSectionProps) {
  const router = useRouter();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Review Queue Card */}
      <Card>
        <CardHeader>
          <CardTitle>Review Queue</CardTitle>
        </CardHeader>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-foreground">{data.review_queue_count}</p>
              <p className="text-sm text-text-muted">Concepts Awaiting Board Approval</p>
            </div>
            <div className="h-14 w-14 rounded-lg bg-info-light/20 flex items-center justify-center">
              <svg className="h-7 w-7 text-info" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {data.review_queue_count > 0 ? (
            <button
              onClick={() => router.push("/board/review")}
              className="w-full mt-4 rounded-lg bg-info px-4 py-2 text-sm font-semibold text-white hover:bg-info/90 transition-colors"
            >
              Review Concepts
            </button>
          ) : (
            <p className="text-sm text-text-muted mt-4">Review queue is empty</p>
          )}
        </div>
      </Card>

      {/* Recent Approvals Card */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <div className="divide-y">
          {data.recent_approvals.length > 0 ? (
            data.recent_approvals.map((approval) => (
              <div
                key={approval.id}
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/concepts/${approval.id}`)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    Concept #{approval.id}
                  </p>
                  <ConceptStatusBadge status="published" />
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Approved {new Date(approval.updated_at).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-text-muted text-sm">
              No recent approvals
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Board Actions</CardTitle>
        </CardHeader>
        <div className="p-4 grid gap-2 sm:grid-cols-3">
          <button
            onClick={() => router.push("/board/review")}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <svg className="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">Review Queue</span>
          </button>
          <button
            onClick={() => router.push("/board/analytics")}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
            </svg>
            <span className="text-sm font-medium">Analytics</span>
          </button>
          <button
            onClick={() => router.push("/recalls")}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <svg className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span className="text-sm font-medium">Recalls</span>
          </button>
        </div>
      </Card>
    </div>
  );
}
