"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateUser } from "@/lib/api/users";
import { useToastStore } from "@/stores/toast-store";
import { useI18n } from "@/i18n/context";
import type { User } from "@/lib/api/types";

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: () => void;
}

export function EditUserModal({
  open,
  onClose,
  user,
  onSuccess,
}: EditUserModalProps) {
  const { t } = useI18n();
  const addToast = useToastStore((s) => s.addToast);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
    } else {
      setName("");
      setEmail("");
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await updateUser(user.id, {
        name: name || undefined,
      });
      addToast({ type: "success", message: t("messages.user_updated") });
      onSuccess?.();
      onClose();
    } catch {
      addToast({ type: "error", message: t("messages.user_update_failed") });
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
    <Modal open={open} onClose={handleClose} title={t("admin.users.edit_user")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t("common.name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("admin.users.name_placeholder")}
          required
        />
        <Input
          label={t("common.email")}
          type="email"
          value={email}
          disabled
          className="opacity-60"
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
