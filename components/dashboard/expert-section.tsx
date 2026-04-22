"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { ExpertRoleData } from "@/lib/api/types";

interface ExpertSectionProps {
  data: ExpertRoleData;
}

export function ExpertSection({ data }: ExpertSectionProps) {
  const router = useRouter();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Pending Tasks Card */}
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">{data.concepts_needing_vote}</p>
              <p className="text-sm text-text-muted">Concepts Needing My Vote</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-warning-light/20 flex items-center justify-center">
              <svg className="h-6 w-6 text-warning" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {data.concepts_needing_vote > 0 ? (
            <button
              onClick={() => router.push("/concepts?status=voting")}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              Review Now
            </button>
          ) : (
            <p className="text-sm text-text-muted">All caught up! No pending votes.</p>
          )}
        </div>
      </Card>

      {/* Recent Discussions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Discussions</CardTitle>
        </CardHeader>
        <div className="divide-y">
          {data.recent_discussions.length > 0 ? (
            data.recent_discussions.map((discussion) => (
              <div
                key={discussion.id}
                className="p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-foreground">
                    {discussion.english_term || "Untitled"}
                  </p>
                  <Badge variant="default" className="text-xs">
                    {discussion.domain_name}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted line-clamp-2">
                  {discussion.body}
                </p>
                <p className="text-[10px] text-text-muted mt-1">
                  {new Date(discussion.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <div className="p-8">
              <EmptyState
                title="No discussions yet"
                description="Be the first to start a discussion in your domains"
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
