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
      addToast({ type: "error", message: "Failed to load API keys" });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

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
      addToast({ type: "success", message: "API key created successfully" });
      fetchKeys();
    } catch {
      addToast({ type: "error", message: "Failed to create API key" });
    } finally {
      setIsCreating(false);
    }
  }, [newKeyName, addToast, fetchKeys]);

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;

    setIsDeleting(true);
    try {
      await deleteApiKey(deleteId);
      setKeys((prev) => prev.filter((k) => k.id !== deleteId));
      setDeleteId(null);
      addToast({ type: "success", message: "API key deleted successfully" });
    } catch {
      addToast({ type: "error", message: "Failed to delete API key" });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteId, addToast]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    addToast({ type: "success", message: "Copied to clipboard" });
  }, [addToast]);

  return (
    <RoleGate roles={["admin"]}>
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: t("nav.admin"), href: "/admin" },
            { label: "API Keys" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">
              API Keys
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Manage API keys for external access to the platform
            </p>
          </div>
          <Button onClick={() => setShowNewKeyModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Key
          </Button>
        </div>

        {/* New Key Display */}
        {newKeyData && (
          <Card className="border-primary-500 bg-primary-50 dark:bg-primary-900/20">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Key className="h-5 w-5 text-primary-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Your New API Key</h3>
                  <p className="text-sm text-text-muted">
                    Save this key now. You won't be able to see it again.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewKeyData(null)}
                >
                  Dismiss
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
                  <span className="text-text-muted">Name:</span>
                  <p className="font-medium">{newKeyData.name}</p>
                </div>
                <div>
                  <span className="text-text-muted">Last Four:</span>
                  <p className="font-medium">{newKeyData.last_four}</p>
                </div>
                <div>
                  <span className="text-text-muted">Expires:</span>
                  <p className="font-medium">
                    {newKeyData.expires_at
                      ? formatDate(newKeyData.expires_at)
                      : "Never"}
                  </p>
                </div>
                <div>
                  <span className="text-text-muted">Abilities:</span>
                  <p className="font-medium">{newKeyData.abilities.join(", ")}</p>
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
              <p className="text-text-muted">No API keys yet</p>
              <p className="text-sm text-text-muted mt-1">
                Generate a key to enable external API access
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
                          <span>Last used: {formatDate(key.last_used_at)}</span>
                        )}
                        {key.expires_at && (
                          <span>Expires: {formatDate(key.expires_at)}</span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 ${
                            key.is_active
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {key.is_active ? "Active" : "Inactive"}
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

                {key.abilities && key.abilities.length > 0 && (
                  <div className="border-t border-border-light px-4 py-2 bg-surface">
                    <p className="text-xs text-text-muted">
                      Permissions:{" "}
                      {key.abilities.map((a) => (
                        <span
                          key={a}
                          className="inline-block px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 mr-1 mb-1"
                        >
                          {a}
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
            title="Generate API Key"
            message="Give your API key a descriptive name to help you identify it later."
            confirmLabel="Generate"
            loading={isCreating}
          >
            <div className="space-y-3">
              <p className="text-sm text-text-muted">
                Give your API key a descriptive name to help you identify it
                later.
              </p>
              <Input
                label="Key Name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production App, Development Script"
                autoFocus
              />
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-300">
                <p className="font-medium">Security Notice</p>
                <p className="mt-1">
                  The API key will only be shown once. Save it securely.
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
          title="Delete API Key"
          message="Are you sure you want to delete this API key? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          loading={isDeleting}
        />
      </div>
    </RoleGate>
  );
}
