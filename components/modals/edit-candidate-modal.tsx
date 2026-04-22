"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateCandidate } from "@/lib/api/candidates";
import { useToastStore } from "@/stores/toast-store";
import { useI18n } from "@/i18n/context";
import type { Candidate } from "@/lib/api/types";

interface EditCandidateModalProps {
  open: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  onSuccess?: () => void;
}

export function EditCandidateModal({
  open,
  onClose,
  candidate,
  onSuccess,
}: EditCandidateModalProps) {
  const { t } = useI18n();
  const addToast = useToastStore((s) => s.addToast);
  const [kurdishTerm, setKurdishTerm] = useState("");
  const [morphologyNotes, setMorphologyNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or candidate changes
  useEffect(() => {
    if (candidate) {
      setKurdishTerm(candidate.kurdish_term?.word ?? "");
      setMorphologyNotes(candidate.morphology_notes ?? "");
    } else {
      setKurdishTerm("");
      setMorphologyNotes("");
    }
  }, [candidate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;

    setIsSubmitting(true);
    try {
      await updateCandidate(candidate.id, {
        kurdish_term: kurdishTerm || undefined,
        morphology_notes: morphologyNotes || undefined,
      });
      addToast({ type: "success", message: t("messages.candidate_updated") });
      onSuccess?.();
      onClose();
    } catch {
      addToast({ type: "error", message: t("messages.candidate_update_failed") });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title={t("concepts.edit_candidate")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t("concepts.kurdish_term")}
          value={kurdishTerm}
          onChange={(e) => setKurdishTerm(e.target.value)}
          placeholder={t("concepts.kurdish_term_placeholder")}
          required
          dir="rtl"
        />
        <Textarea
          label={t("concepts.morphology_notes")}
          value={morphologyNotes}
          onChange={(e) => setMorphologyNotes(e.target.value)}
          placeholder={t("concepts.morphology_notes_placeholder")}
          rows={3}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
