"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateDomain } from "@/lib/api/domains";
import { useToastStore } from "@/stores/toast-store";
import { useI18n } from "@/i18n/context";
import type { Domain } from "@/lib/api/types";

interface EditDomainModalProps {
  open: boolean;
  onClose: () => void;
  domain: Domain | null;
  onSuccess?: () => void;
}

export function EditDomainModal({
  open,
  onClose,
  domain,
  onSuccess,
}: EditDomainModalProps) {
  const { t } = useI18n();
  const addToast = useToastStore((s) => s.addToast);
  const [name, setName] = useState("");
  const [nameKu, setNameKu] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionKu, setDescriptionKu] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or domain changes
  useEffect(() => {
    if (domain) {
      setName(domain.name ?? "");
      setNameKu(domain.name_i18n?.ku ?? "");
      setDescription(domain.description ?? "");
      setDescriptionKu(domain.description_i18n?.ku ?? "");
    } else {
      setName("");
      setNameKu("");
      setDescription("");
      setDescriptionKu("");
    }
  }, [domain, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;

    setIsSubmitting(true);
    try {
      await updateDomain(domain.id, {
        name: name || undefined,
        description: description || undefined,
      });
      addToast({ type: "success", message: t("messages.domain_updated") });
      onSuccess?.();
      onClose();
    } catch {
      addToast({ type: "error", message: t("messages.domain_update_failed") });
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
    <Modal open={open} onClose={handleClose} title={t("domains.edit_domain")} className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t("domains.english_name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("domains.english_name_placeholder")}
          required
        />
        <Input
          label={t("domains.kurdish_name")}
          value={nameKu}
          onChange={(e) => setNameKu(e.target.value)}
          placeholder={t("domains.kurdish_name_placeholder")}
          dir="rtl"
        />
        <Textarea
          label={t("domains.english_description")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("domains.english_description_placeholder")}
          rows={3}
        />
        <Textarea
          label={t("domains.kurdish_description")}
          value={descriptionKu}
          onChange={(e) => setDescriptionKu(e.target.value)}
          placeholder={t("domains.kurdish_description_placeholder")}
          rows={3}
          dir="rtl"
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
