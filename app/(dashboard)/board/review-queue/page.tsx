"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/hooks/use-api";
import { RoleGate } from "@/components/auth/role-gate";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { SkeletonTable } from "@/components/ui/skeleton";
import { ReviewQueueRow } from "@/components/board/review-queue-row";
import { BatchActionBar } from "@/components/board/batch-action-bar";
import { batchApprove } from "@/lib/api/board";
import { useToastStore } from "@/stores/toast-store";
import type { PaginatedResponse, ReviewQueueItem } from "@/lib/api/types";
import { useI18n } from "@/i18n/context";

const sortValues = ["", "oldest", "newest", "cs_asc", "cs_desc"] as const;
const sortKeys: Record<string, string> = {
  "": "sort_options.default",
  oldest: "sort_options.oldest",
  newest: "sort_options.newest",
  cs_asc: "sort_options.cs_asc",
  cs_desc: "sort_options.cs_desc",
};

export default function BoardReviewQueuePage() {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [domainId, setDomainId] = useState("");
  const [closeCall, setCloseCall] = useState(false);
  const [sort, setSort] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);

  const params = new URLSearchParams();
  if (domainId) params.set("domain_id", domainId);
  if (closeCall) params.set("close_call", "true");
  if (sort) params.set("sort", sort);
  params.set("page", String(page));

  const { data, isLoading, refetch } = useApi<PaginatedResponse<ReviewQueueItem>>(
    `/api/v1/board/review-queue?${params}`
  );

  const toggleSelect = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBatchApprove = useCallback(async () => {
    setBatchLoading(true);
    try {
      await batchApprove(Array.from(selected));
      const count = selected.size;
      setSelected(new Set());
      refetch();
      addToast({ type: "success", message: t("messages.concept_approved", { count }) });
    } catch {
      addToast({ type: "error", message: t("messages.batch_approval_failed") });
    } finally {
      setBatchLoading(false);
    }
  }, [selected, refetch, addToast]);

  return (
    <RoleGate roles={["main_board", "admin"]}>
      <div className="space-y-6">
        <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">
          {t("board.review_queue")}
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="date"
            placeholder={t("common.from_date")}
            className="w-40"
            onChange={(e) => {
              /* date filter - wired to API */
            }}
          />
          <Input
            type="date"
            placeholder={t("common.to_date")}
            className="w-40"
            onChange={(e) => {
              /* date filter */
            }}
          />
          <label className="flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={closeCall}
              onChange={(e) => {
                setCloseCall(e.target.checked);
                setPage(1);
              }}
              className="rounded border-border text-primary focus:ring-primary"
            />
            {t("board.close_calls_only")}
          </label>
          <Select
            options={sortValues.map((v) => ({ value: v, label: t(sortKeys[v]) }))}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            placeholder={t("common.sort")}
            className="w-44"
          />
        </div>

        <BatchActionBar
          selectedCount={selected.size}
          onApprove={handleBatchApprove}
          onClear={() => setSelected(new Set())}
          loading={batchLoading}
        />

        {/* Table */}
        {isLoading ? (
          <SkeletonTable rows={8} />
        ) : data?.data && data.data.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-lg border border-border bg-surface-raised">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-light bg-surface text-start text-[11px] font-semibold uppercase tracking-[0.05em] text-text-muted">
                    <th className="px-4 py-3 w-10" />
                    <th className="px-4 py-3">{t("concepts.english_term")}</th>
                    <th className="px-4 py-3">{t("concepts.domain")}</th>
                    <th className="px-4 py-3">{t("concepts.leading_candidate")}</th>
                    <th className="px-4 py-3">{t("board.consensus_score_short")}</th>
                    <th className="px-4 py-3">{t("board.votes")}</th>
                    <th className="px-4 py-3">{t("common.status")}</th>
                    <th className="px-4 py-3">{t("board.updated")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((item) => (
                    <ReviewQueueRow
                      key={item.id}
                      item={item}
                      selected={selected.has(item.id)}
                      onToggle={toggleSelect}
                      onClick={(id) =>
                        router.push(`/board/review/${id}`)
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={data.current_page}
              lastPage={data.last_page}
              onPageChange={setPage}
            />
          </>
        ) : (
          <p className="py-8 text-center text-[13px] text-text-muted">
            {t("board.no_items")}
          </p>
        )}
      </div>
    </RoleGate>
  );
}
