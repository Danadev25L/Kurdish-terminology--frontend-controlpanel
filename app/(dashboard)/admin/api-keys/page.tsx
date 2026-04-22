"use client";

import { useState, useCallback, useEffect } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { RoleGate } from "@/components/auth/role-gate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToastStore } from "@/stores/toast-store";
import { getApiKeys, createApiKey, deleteApiKey } from "@/lib/api/api-keys";
import type { ApiKey, CreateApiKeyData, CreateApiKeyResponse } from "@/lib/api/types";
import { useI18n } from "@/i18n/context";
import { Key, Plus, Trash2, Copy, Eye, EyeOff, Calendar, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

export default function ApiKeysPage() {
  const { t } = useI18n();
  const addToast = useToastStore((s) => s.addToast);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyData, setNewKeyData] = useState<CreateApiKeyResponse | null>(null);
  const [showKey, setShowKey] = useState<Record<number, boolean>>({});

  const fetchKeys = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getApiKeys();
      setKeys(data);
    } catch {
      addToast({ type: "error", message: t("common.error_generic") });
    } finally {
      setIsLoading(false);
    }
  }, [addToast, t]);

  // Fetch keys on mount
  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = useCallback(async () => {
    if (!newKeyName.trim()) return;

    setIsCreating(true);
    try {
      const data: CreateApiKeyResponse = await createApiKey({
        name: newKeyName.trim(),
      } as CreateApiKeyData);
      setNewKeyData(data);
      setShowNewKeyModal(false);
      setNewKeyName("");
      addToast({ type: "success", message: t("messages.source_created") });
      fetchKeys();
    } catch {
      addToast({ type: "error", message: t("messages.source_create_failed") });
    } finally {
      setIsCreating(false);
    }
  }, [newKeyName, addToast, fetchKeys, t]);

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;

    setIsDeleting(true);
    try {
      await deleteApiKey(deleteId);
      setKeys((prev) => prev.filter((k) => k.id !== deleteId));
      setDeleteId(null);
      addToast({ type: "success", message: t("messages.source_deleted") });
    } catch {
      addToast({ type: "error", message: t("messages.source_delete_failed") });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteId, addToast, t]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    addToast({ type: "success", message: t("common.save") });
  }, [addToast, t]);

  return (
    <RoleGate roles={["admin"]}>
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: t("nav.admin"), href: "/admin" },
            { label: t("nav.api_keys") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">
              {t("nav.api_keys")}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {t("api_keys_page.subtitle")}
            </p>
          </div>
          <Button onClick={() => setShowNewKeyModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("api_keys_page.generate_key")}
          </Button>
        </div>

        {/* New Key Display */}
        {newKeyData && (
          <Card className="border-primary-500 bg-primary-50 dark:bg-primary-900/20">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Key className="h-5 w-5 text-primary-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{t("api_keys_page.new_key_title")}</h3>
                  <p className="text-sm text-text-muted">
                    {t("api_keys_page.new_key_message")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewKeyData(null)}
                >
                  {t("common.close")}
                </Button>
              </div>

              <div className="rounded-lg bg-white dark:bg-gray-900 p-3">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-mono text-foreground break-all">
                    {newKeyData.key}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(newKeyData.key)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-text-muted">{t("common.name")}:</span>
                  <p className="font-medium">{newKeyData.name}</p>
                </div>
                <div>
                  <span className="text-text-muted">{t("api_keys_page.last_four")}:</span>
                  <p className="font-medium">{newKeyData.last_four}</p>
                </div>
                <div>
                  <span className="text-text-muted">{t("api_keys_page.expires")}:</span>
                  <p className="font-medium">
                    {newKeyData.expires_at
                      ? formatDate(newKeyData.expires_at)
                      : t("api_keys_page.never")}
                  </p>
                </div>
                <div>
                  <span className="text-text-muted">{t("api_keys_page.scopes")}:</span>
                  <p className="font-medium">{newKeyData.scopes.join(", ")}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Keys List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : keys.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-muted">{t("api_keys_page.empty_title")}</p>
              <p className="text-sm text-text-muted mt-1">
                {t("api_keys_page.empty_message")}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <Card key={key.id} padding={false}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{key.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-text-muted">
                        <span className="font-mono">•••• {key.last_four}</span>
                        {key.last_used_at && (
                          <span>{t("api_keys_page.last_used")}: {formatDate(key.last_used_at)}</span>
                        )}
                        {key.expires_at && (
                          <span>{t("api_keys_page.expires")}: {formatDate(key.expires_at)}</span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 ${
                            key.is_active
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {key.is_active ? t("statuses.active") : t("api_keys_page.inactive")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setShowKey((prev) => ({
                          ...prev,
                          [key.id]: !prev[key.id],
                        }))
                      }
                    >
                      {showKey[key.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteId(key.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {key.scopes && key.scopes.length > 0 && (
                  <div className="border-t border-border-light px-4 py-2 bg-surface">
                    <p className="text-xs text-text-muted">
                      {t("api_keys_page.permissions")}:{" "}
                      {key.scopes.map((s) => (
                        <span
                          key={s}
                          className="inline-block px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 mr-1 mb-1"
                        >
                          {s}
                        </span>
                      ))}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Create Key Modal */}
        {showNewKeyModal && (
          <ConfirmationDialog
            open={showNewKeyModal}
            onClose={() => {
              setShowNewKeyModal(false);
              setNewKeyName("");
            }}
            onConfirm={handleCreate}
            title={t("api_keys_page.generate_key")}
            message={t("api_keys_page.generate_message")}
            confirmLabel={t("api_keys_page.generate")}
            loading={isCreating}
          >
            <div className="space-y-3">
              <p className="text-sm text-text-muted">
                {t("api_keys_page.generate_message")}
              </p>
              <Input
                label={t("api_keys_page.key_name")}
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder={t("api_keys_page.key_name_placeholder")}
                autoFocus
              />
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-300">
                <p className="font-medium">{t("api_keys_page.security_notice")}</p>
                <p className="mt-1">
                  {t("api_keys_page.security_message")}
                </p>
              </div>
            </div>
          </ConfirmationDialog>
        )}

        {/* Delete Confirmation */}
        <ConfirmationDialog
          open={deleteId !== null}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title={t("api_keys_page.delete_title")}
          message={t("api_keys_page.delete_message")}
          confirmLabel={t("common.delete")}
          variant="danger"
          loading={isDeleting}
        />
      </div>
    </RoleGate>
  );
}
