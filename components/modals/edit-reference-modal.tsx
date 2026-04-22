"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateReferenceSource } from "@/lib/api/references";
import { useToastStore } from "@/stores/toast-store";
import { useI18n } from "@/i18n/context";
import type { ReferenceSource, ReferenceSourceType } from "@/lib/api/types";

interface EditReferenceModalProps {
  open: boolean;
  onClose: () => void;
  reference: ReferenceSource | null;
  onSuccess?: () => void;
}

const sourceTypeValues: { value: ReferenceSourceType; key: string }[] = [
  { value: "academic", key: "source_types.academic" },
  { value: "dictionary", key: "source_types.dictionary" },
  { value: "government", key: "source_types.government" },
  { value: "encyclopedia", key: "source_types.encyclopedia" },
  { value: "journal", key: "source_types.journal" },
  { value: "other", key: "source_types.other" },
];

export function EditReferenceModal({
  open,
  onClose,
  reference,
  onSuccess,
}: EditReferenceModalProps) {
  const { t } = useI18n();
  const addToast = useToastStore((s) => s.addToast);
  const [name, setName] = useState("");
  const [type, setType] = useState<ReferenceSourceType>("dictionary");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or reference changes
  useEffect(() => {
    if (reference) {
      setName(reference.name ?? "");
      setType(reference.type ?? "dictionary");
      setDescription(reference.description ?? "");
    } else {
      setName("");
      setType("dictionary");
      setDescription("");
    }
  }, [reference, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference) return;

    setIsSubmitting(true);
    try {
      await updateReferenceSource(reference.id, {
        name: name || undefined,
        type: type || undefined,
        description: description || undefined,
      });
      addToast({ type: "success", message: t("messages.reference_updated") });
      onSuccess?.();
      onClose();
    } catch {
      addToast({ type: "error", message: t("messages.reference_update_failed") });
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
    <Modal open={open} onClose={handleClose} title={t("admin.references.edit_reference")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t("common.name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("admin.references.name_placeholder")}
          required
        />
        <Select
          label={t("admin.references.type")}
          options={sourceTypeValues.map((s) => ({ value: s.value, label: t(s.key) }))}
          value={type}
          onChange={(e) => setType(e.target.value as ReferenceSourceType)}
          required
        />
        <Textarea
          label={t("admin.references.description")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("admin.references.desc_placeholder")}
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
