"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/hooks/use-api";
import { useRole } from "@/lib/hooks/use-role";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { ConceptStatusBadge } from "@/components/domain/concept-status-badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PriorityIndicator } from "@/components/domain/priority-indicator";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import type { PaginatedResponse, Concept } from "@/lib/api/types";
import { timeAgo } from "@/lib/utils/format";
import { useI18n } from "@/i18n/context";

export default function MyTasksPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { isAdmin, isMainBoard, isExpert, isDomainHead } = useRole();

  const statusOptions = [
    { value: "", label: t("concepts.all_statuses") },
    { value: "draft", label: t("statuses.draft") },
    { value: "threshold", label: t("statuses.threshold") },
    { value: "voting", label: t("statuses.voting") },
    { value: "review", label: t("statuses.review") },
    { value: "recalled", label: t("statuses.recalled") },
  ];

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("q", search);
  params.set("page", String(page));

  const { data, isLoading, refetch } = useApi<PaginatedResponse<Concept>>(
    `/api/v1/concepts/inbox?${params}`
  );

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const getUrgencyLevel = (concept: Concept): "urgent" | "normal" | "low" => {
    // Check if user hasn't voted yet and threshold is active
    const hasVoted = false; // This would be populated from API
    const isThresholdActive = concept.status === "threshold";
    const isVotingActive = concept.status === "voting";

    // Check deadline urgency
    if (concept.threshold_deadline) {
      const hoursUntilDeadline = new Date(concept.threshold_deadline).getTime() - Date.now();
      if (hoursUntilDeadline > 0 && hoursUntilDeadline < 24 * 60 * 60 * 1000) {
        return "urgent";
      }
    }

    if (concept.voting_deadline) {
      const hoursUntilDeadline = new Date(concept.voting_deadline).getTime() - Date.now();
      if (hoursUntilDeadline > 0 && hoursUntilDeadline < 24 * 60 * 60 * 1000) {
        return "urgent";
      }
    }

    // Priority-based urgency
    if (concept.priority === "critical" || concept.priority === "urgent") {
      return "urgent";
    }

    return "normal";
  };

  const getActionNeeded = (concept: Concept): string | null => {
    switch (concept.status) {
      case "draft":
        return isDomainHead || isAdmin ? t("my_tasks.actions.review_advance") : null;
      case "threshold":
        return isExpert ? t("my_tasks.actions.cast_threshold_vote") : null;
      case "voting":
        return isExpert ? t("my_tasks.actions.submit_consensus_scores") : null;
      case "review":
        return isMainBoard || isAdmin ? t("my_tasks.actions.board_review") : null;
      case "recalled":
        return isExpert ? t("my_tasks.actions.address_recall") : null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">
            {t("nav.my_tasks")}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {t("my_tasks.subtitle")}
          </p>
        </div>
        <Button onClick={() => refetch()}>
          {t("my_tasks.refresh")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder={t("my_tasks.search_placeholder")}
          className="w-64"
        />
        <Select
          options={statusOptions}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          placeholder={t("my_tasks.filter_status")}
          className="w-44"
        />
      </div>

      {/* Urgent Alert */}
      {data?.data && data.data.some(c => getUrgencyLevel(c) === "urgent") && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-200">
                {t("my_tasks.urgent_title")}
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {t("my_tasks.urgent_message")}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="space-y-3">
          {data.data
            .sort((a, b) => {
              // Sort by urgency first, then by priority
              const urgencyOrder = { urgent: 0, normal: 1, low: 2 };
              const urgencyA = getUrgencyLevel(a);
              const urgencyB = getUrgencyLevel(b);
              if (urgencyA !== urgencyB) {
                return urgencyOrder[urgencyA] - urgencyOrder[urgencyB];
              }
              // Then by priority
              const priorityOrder = { critical: 0, urgent: 1, high: 2, normal: 3, low: 4 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
            .map((concept) => {
              const urgency = getUrgencyLevel(concept);
              const actionNeeded = getActionNeeded(concept);

              return (
                <button
                  key={concept.id}
                  onClick={() => router.push(`/concepts/${concept.id}`)}
                  className="w-full text-start"
                >
                  <Card
                    className={`hover:shadow-md transition-shadow cursor-pointer ${
                      urgency === "urgent"
                        ? "border-l-4 border-l-amber-500"
                        : ""
                    }`}
                    padding={false}
                  >
                    <div className="flex items-start gap-4 p-4">
                      {/* Urgency Indicator */}
                      <div className="flex-shrink-0 pt-1">
                        {urgency === "urgent" ? (
                          <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {concept.english_term?.word ?? t("my_tasks.untitled_concept")}
                          </h3>
                          <ConceptStatusBadge status={concept.status} />
                          <PriorityIndicator priority={concept.priority} />
                        </div>
                        <p className="text-sm text-text-muted line-clamp-1 mb-2">
                          {concept.definition}
                        </p>

                        {/* Action Needed Badge */}
                        {actionNeeded && (
                          <Badge
                            variant={urgency === "urgent" ? "danger" : "primary"}
                            className="text-xs"
                          >
                            {actionNeeded}
                          </Badge>
                        )}

                        {/* Deadline Warning */}
                        {urgency === "urgent" && (concept.threshold_deadline || concept.voting_deadline) && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-amber-600 dark:text-amber-400">
                            <Clock className="h-3 w-3" />
                            <span>
                              {t("my_tasks.deadline")}: {timeAgo(concept.threshold_deadline ?? concept.voting_deadline!)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="flex-shrink-0 text-xs text-text-muted">
                        {timeAgo(concept.updated_at)}
                      </div>
                    </div>
                  </Card>
                </button>
              );
            })}
          <Pagination
            currentPage={data.current_page}
            lastPage={data.last_page}
            onPageChange={setPage}
          />
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-text-muted">
              {t("my_tasks.empty")}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
