"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/hooks/use-api";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRole } from "@/lib/hooks/use-role";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { ConceptStatusBadge } from "@/components/domain/concept-status-badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import type { PaginatedResponse, Concept } from "@/lib/api/types";
import { timeAgo } from "@/lib/utils/format";
import { useI18n } from "@/i18n/context";
import { deleteConcept } from "@/lib/api/concepts";
import { useToastStore } from "@/stores/toast-store";
import { Trash2 } from "lucide-react";

export default function ConceptsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const addToast = useToastStore((s) => s.addToast);
  const { t } = useI18n();
  const { isExpert, isDomainHead, isAdmin } = useRole();

  const statusOptions = [
    { value: "", label: t("concepts.all_statuses") },
    { value: "draft", label: t("statuses.draft") },
    { value: "threshold", label: t("statuses.threshold") },
    { value: "voting", label: t("statuses.voting") },
    { value: "review", label: t("statuses.review") },
    { value: "published", label: t("statuses.published") },
    { value: "recalled", label: t("statuses.recalled") },
  ];
  const [status, setStatus] = useState("");
  const [domainId, setDomainId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (domainId) params.set("domain_id", domainId);
  if (search) params.set("q", search);
  params.set("page", String(page));

  const { data, isLoading, refetch } = useApi<PaginatedResponse<Concept>>(
    `/api/v1/concepts?${params}`
  );

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleWithdraw = useCallback(
    async (conceptId: number) => {
      const confirmed = window.confirm(t("concepts.withdraw_confirm"));
      if (!confirmed) return;

      try {
        await deleteConcept(conceptId);
        addToast({ type: "success", message: t("messages.concept_deleted") });
        refetch();
      } catch {
        addToast({ type: "error", message: t("messages.concept_delete_failed") });
      }
    },
    [addToast, refetch, t]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">{t("concepts.title")}</h1>
        {(isExpert || isAdmin) && (
          <Button onClick={() => router.push("/concepts/new")}>
            {t("concepts.new_concept")}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder={t("concepts.search_placeholder")}
          className="w-64"
        />
        <Select
          options={statusOptions}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          placeholder={t("common.status")}
          className="w-44"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="space-y-3">
          {data.data.map((concept) => {
            const authorId = (concept as Concept & { authorId?: number; author_id?: number }).authorId
              ?? (concept as Concept & { authorId?: number; author_id?: number }).author_id
              ?? concept.created_by;
            const isPending = ["draft", "threshold", "voting", "review"].includes(concept.status);
            const canWithdraw = isPending && user?.id === authorId;

            return (
              <button
                key={concept.id}
                onClick={() => router.push(`/concepts/${concept.id}`)}
                className="w-full text-left hover:shadow-md transition-shadow"
              >
                <Card padding={false}>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {concept.english_term?.word ?? t("concepts.untitled")}
                        </h3>
                        <p className="mt-0.5 text-sm text-text-muted line-clamp-1">
                          {concept.definition}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {canWithdraw && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWithdraw(concept.id);
                        }}
                        aria-label={t("common.delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <ConceptStatusBadge status={concept.status} />
                    <span className="text-xs text-text-muted">
                      {timeAgo(concept.updated_at)}
                    </span>
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
          <p className="text-center text-sm text-text-muted">
            {t("concepts.no_results")}
          </p>
        </Card>
      )}
    </div>
  );
}
