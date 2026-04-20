"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/hooks/use-api";
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

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "threshold", label: "Threshold" },
  { value: "voting", label: "Voting" },
  { value: "review", label: "Board Review" },
  { value: "published", label: "Published" },
  { value: "recalled", label: "Recalled" },
];

export default function ConceptsPage() {
  const router = useRouter();
  const { isExpert, isDomainHead, isAdmin } = useRole();
  const [status, setStatus] = useState("");
  const [domainId, setDomainId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (domainId) params.set("domain_id", domainId);
  if (search) params.set("q", search);
  params.set("page", String(page));

  const { data, isLoading } = useApi<PaginatedResponse<Concept>>(
    `/api/v1/concepts?${params}`,
    { pollingInterval: 120000 }
  );

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">Concepts</h1>
        {(isExpert || isAdmin) && (
          <Button onClick={() => router.push("/concepts/new")}>
            New Concept
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Search concepts..."
          className="w-64"
        />
        <Select
          options={statusOptions}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          placeholder="Status"
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
          {data.data.map((concept) => (
            <button
              key={concept.id}
              onClick={() => router.push(`/concepts/${concept.id}`)}
              className="w-full text-start"
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer" padding={false}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {concept.english_term?.word ?? "Untitled"}
                      </h3>
                      <p className="mt-0.5 text-sm text-text-muted line-clamp-1">
                        {concept.definition}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ConceptStatusBadge status={concept.status} />
                    <span className="text-xs text-text-muted">
                      {timeAgo(concept.updated_at)}
                    </span>
                  </div>
                </div>
              </Card>
            </button>
          ))}
          <Pagination
            currentPage={data.current_page}
            lastPage={data.last_page}
            onPageChange={setPage}
          />
        </div>
      ) : (
        <Card>
          <p className="text-center text-sm text-text-muted">
            No concepts found matching your filters.
          </p>
        </Card>
      )}
    </div>
  );
}
