"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/hooks/use-api";
import { RoleGate } from "@/components/auth/role-gate";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { ReviewQueueRow } from "@/components/board/review-queue-row";
import { BatchActionBar } from "@/components/board/batch-action-bar";
import { batchApprove } from "@/lib/api/board";
import type { PaginatedResponse, ReviewQueueItem } from "@/lib/api/types";

const sortOptions = [
  { value: "", label: "Default" },
  { value: "oldest", label: "Oldest Update" },
  { value: "newest", label: "Newest Update" },
  { value: "cs_asc", label: "Score: Low to High" },
  { value: "cs_desc", label: "Score: High to Low" },
];

export default function BoardReviewQueuePage() {
  const router = useRouter();
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
    `/api/v1/board/review-queue?${params}`,
    { pollingInterval: 120000 }
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
      setSelected(new Set());
      refetch();
    } finally {
      setBatchLoading(false);
    }
  }, [selected, refetch]);

  return (
    <RoleGate roles={["main_board", "admin"]}>
      <div className="space-y-6">
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-[#111827]">
          Board Review Queue
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="date"
            placeholder="From date"
            className="w-40"
            onChange={(e) => {
              /* date filter - wired to API */
            }}
          />
          <Input
            type="date"
            placeholder="To date"
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
              className="rounded border-[#e5e7eb] text-primary focus:ring-primary"
            />
            Close calls only
          </label>
          <Select
            options={sortOptions}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            placeholder="Sort"
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
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : data?.data && data.data.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-lg border border-[#e5e7eb] bg-white">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3f4f6] bg-surface text-start text-[11px] font-semibold uppercase tracking-[0.05em] text-[#9ca3af]">
                    <th className="px-4 py-3 w-10" />
                    <th className="px-4 py-3">English Term</th>
                    <th className="px-4 py-3">Domain</th>
                    <th className="px-4 py-3">Leading Candidate</th>
                    <th className="px-4 py-3">Cs</th>
                    <th className="px-4 py-3">Votes</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Updated</th>
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
          <p className="py-8 text-center text-[13px] text-[#9ca3af]">
            No items in the review queue.
          </p>
        )}
      </div>
    </RoleGate>
  );
}
