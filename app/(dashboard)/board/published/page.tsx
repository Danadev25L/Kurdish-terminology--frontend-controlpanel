"use client";

import { useState, useCallback } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { RoleGate } from "@/components/auth/role-gate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ConceptStatusBadge } from "@/components/domain/concept-status-badge";
import { api } from "@/lib/api/client";
import { useToastStore } from "@/stores/toast-store";
import { timeAgo } from "@/lib/utils/format";
import type { Concept, PaginatedResponse } from "@/lib/api/types";
import { useI18n } from "@/i18n/context";

export default function BoardPublishedPage() {
  const addToast = useToastStore((s) => s.addToast);
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [recallOpen, setRecallOpen] = useState(false);
  const [recallId, setRecallId] = useState<number | null>(null);
  const [recallReason, setRecallReason] = useState("");
  const [recallLoading, setRecallLoading] = useState(false);

  const params = new URLSearchParams();
  params.set("status", "published");
  if (search) params.set("q", search);
  params.set("page", String(page));

  const { data, isLoading, refetch } = useApi<PaginatedResponse<Concept>>(
    `/api/v1/concepts?${params}`
  );

  const handleRecall = useCallback(async () => {
    if (!recallId || !recallReason.trim()) return;
    setRecallLoading(true);
    try {
      await api.post(`/api/v1/concepts/${recallId}/reopen`, {
        reason: recallReason,
      });
      setRecallOpen(false);
      setRecallReason("");
      refetch();
      addToast({ type: "success", message: t("messages.term_recalled") });
    } catch {
      addToast({ type: "error", message: t("messages.term_recall_failed") });
    } finally {
      setRecallLoading(false);
    }
  }, [recallId, recallReason, refetch, addToast]);

  return (
    <RoleGate roles={["main_board", "admin"]}>
      <div className="space-y-6">
        <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">
          {t("board.published_terms")}
        </h1>

        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder={t("board.search_published")}
          className="max-w-xl"
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : data?.data && data.data.length > 0 ? (
          <>
            <div className="space-y-3">
              {data.data.map((concept) => (
                <Card key={concept.id} padding={false}>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {concept.english_term?.word ?? t("concepts.untitled")}
                        </h3>
                        {concept.winner_candidate && (
                          <span className="text-[13px]" dir="rtl">
                            — {concept.winner_candidate.kurdish_term?.word}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge>{concept.domain?.name ?? t("common.dash")}</Badge>
                        <span className="text-xs text-text-muted">
                          {timeAgo(concept.updated_at)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setRecallId(concept.id);
                        setRecallOpen(true);
                      }}
                    >
                      Recall
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <Pagination
              currentPage={data.current_page}
              lastPage={data.last_page}
              onPageChange={setPage}
            />
          </>
        ) : (
          <p className="py-8 text-center text-[13px] text-text-muted">
            {t("board.no_published")}
          </p>
        )}

        {/* Recall dialog */}
        <ConfirmationDialog
          open={recallOpen}
          onClose={() => {
            setRecallOpen(false);
            setRecallReason("");
          }}
          onConfirm={handleRecall}
          title={t("board.recall")}
          message={t("board.recall_msg")}
          confirmLabel={t("board.recall")}
          variant="danger"
          loading={recallLoading}
        >
          <div className="mt-3">
            <Textarea
              value={recallReason}
              onChange={(e) => setRecallReason(e.target.value)}
              placeholder={t("board.recall_reason_placeholder")}
              rows={3}
            />
          </div>
        </ConfirmationDialog>
      </div>
    </RoleGate>
  );
}
