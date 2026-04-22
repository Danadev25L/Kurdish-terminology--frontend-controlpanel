"use client";

import { useState } from "react";
import { useRole } from "@/lib/hooks/use-role";
import { useAuth } from "@/lib/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EditCandidateModal } from "@/components/modals/edit-candidate-modal";
import { formatNumber } from "@/lib/utils/format";
import { deleteCandidate } from "@/lib/api/candidates";
import { useToastStore } from "@/stores/toast-store";
import { useI18n } from "@/i18n/context";
import type { Candidate } from "@/lib/api/types";

interface CandidateCardProps {
  candidate: Candidate;
  isWinner?: boolean;
  showActions?: boolean;
  onWithdraw?: (id: number) => void;
  onRefresh?: () => void;
}

export function CandidateCard({
  candidate,
  isWinner = false,
  showActions = false,
  onWithdraw,
  onRefresh,
}: CandidateCardProps) {
  const { isExpert, isDomainHead, isAdmin } = useRole();
  const { user } = useAuth();
  const { t } = useI18n();
  const addToast = useToastStore((s) => s.addToast);
  const term = candidate.kurdish_term;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canEdit = isExpert || isDomainHead || isAdmin;
  const canDelete = isAdmin;
  const canWithdraw = user?.id === candidate.author_id;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCandidate(candidate.id);
      addToast({ type: "success", message: t("messages.candidate_deleted") });
      onRefresh?.();
    } catch {
      addToast({ type: "error", message: t("messages.candidate_delete_failed") });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card
        className={`relative ${isWinner ? "ring-2 ring-success" : ""}`}
      >
        {isWinner && (
          <div className="absolute -top-2 end-3">
            <Badge variant="success">Winner</Badge>
          </div>
        )}

        <div className="space-y-3">
          {/* Term info */}
          <div>
            <h3 className="text-lg font-semibold text-foreground" dir="rtl">
              {term?.word ?? "—"}
            </h3>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {term?.dialect_tag && <Badge>{term.dialect_tag}</Badge>}
              {term?.part_of_speech && <Badge>{term.part_of_speech}</Badge>}
            </div>
          </div>

          {candidate.usage_example && (
            <p className="text-[13px] text-text-muted" dir="rtl">
              {candidate.usage_example}
            </p>
          )}

          {candidate.morphology_notes && (
            <p className="text-[13px] text-text-muted">{candidate.morphology_notes}</p>
          )}

          {/* Metrics */}
          {candidate.metrics && (
            <div className="grid grid-cols-4 gap-2 border-t border-border pt-3">
              <Metric label="Cs" value={formatNumber(candidate.metrics.consensus_score)} />
              <Metric label="Mean" value={formatNumber(candidate.metrics.mean)} />
              <Metric label="Std Dev" value={formatNumber(candidate.metrics.std_dev)} />
              <Metric label="Votes" value={String(candidate.metrics.vote_count)} />
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="border-t border-border pt-3 flex flex-wrap gap-2">
              {canEdit && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditModalOpen(true)}
                >
                  {t("common.edit")}
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  {t("common.delete")}
                </Button>
              )}
              {onWithdraw && canWithdraw && !candidate.withdrawn_at && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmOpen(true)}
                >
                  {t("concepts.withdraw")}
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Withdraw Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          onWithdraw?.(candidate.id);
          setConfirmOpen(false);
        }}
        title={t("concepts.withdraw_candidate")}
        message={t("concepts.withdraw_confirm")}
        confirmLabel={t("concepts.withdraw")}
        variant="danger"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title={t("concepts.delete_candidate")}
        message={t("concepts.delete_candidate_confirm", { term: term?.word ?? "—" })}
        confirmLabel={t("common.delete")}
        variant="danger"
        loading={isDeleting}
      />

      {/* Edit Modal */}
      <EditCandidateModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        candidate={candidate}
        onSuccess={onRefresh}
      />
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[11px] text-text-muted">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
