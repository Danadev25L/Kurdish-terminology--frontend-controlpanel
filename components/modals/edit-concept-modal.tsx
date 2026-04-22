"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateConcept } from "@/lib/api/concepts";
import { useToastStore } from "@/stores/toast-store";
import { useI18n } from "@/i18n/context";
import type { Concept } from "@/lib/api/types";

interface EditConceptModalProps {
  open: boolean;
  onClose: () => void;
  concept: Concept | null;
  onSuccess?: () => void;
}

export function EditConceptModal({
  open,
  onClose,
  concept,
  onSuccess,
}: EditConceptModalProps) {
  const { t } = useI18n();
  const addToast = useToastStore((s) => s.addToast);
  const [englishTerm, setEnglishTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or concept changes
  useEffect(() => {
    if (concept) {
      setEnglishTerm(concept.english_term?.word ?? "");
      setDefinition(concept.definition ?? "");
    } else {
      setEnglishTerm("");
      setDefinition("");
    }
  }, [concept, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept) return;

    setIsSubmitting(true);
    try {
      await updateConcept(concept.id, {
        english_term: englishTerm || undefined,
        definition: definition || undefined,
      });
      addToast({ type: "success", message: t("messages.concept_updated") });
      onSuccess?.();
      onClose();
    } catch {
      addToast({ type: "error", message: t("messages.concept_update_failed") });
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
    <Modal open={open} onClose={handleClose} title={t("concepts.edit_concept")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t("concepts.english_term")}
          value={englishTerm}
          onChange={(e) => setEnglishTerm(e.target.value)}
          placeholder={t("concepts.english_term_placeholder")}
          required
        />
        <Textarea
          label={t("concepts.definition")}
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          placeholder={t("concepts.definition_placeholder")}
          rows={4}
          required
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
