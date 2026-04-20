"use client";

import { useState, useCallback, useRef } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { createReferenceSource, importReferenceEntries } from "@/lib/api/references";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToastStore } from "@/stores/toast-store";
import type { ReferenceSource, ReferenceSourceType } from "@/lib/api/types";
import { useI18n } from "@/i18n/context";

interface PaginatedSources {
  data: ReferenceSource[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

const sourceTypeValues: { value: ReferenceSourceType; key: string }[] = [
  { value: "academic", key: "source_types.academic" },
  { value: "dictionary", key: "source_types.dictionary" },
  { value: "government", key: "source_types.government" },
  { value: "encyclopedia", key: "source_types.encyclopedia" },
  { value: "journal", key: "source_types.journal" },
  { value: "other", key: "source_types.other" },
];

export default function AdminReferencesPage() {
  const addToast = useToastStore((s) => s.addToast);
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const { data: sourcesData, isLoading, refetch } = useApi<PaginatedSources>(
    `/api/v1/reference-sources?page=${page}`
  );

  // Extract sources array from paginated response
  const sources = sourcesData?.data ?? [];
  const currentPage = sourcesData?.current_page ?? 1;
  const lastPage = sourcesData?.last_page ?? 1;
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<ReferenceSourceType>("dictionary");
  const [desc, setDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setCreating(true);
      try {
        await createReferenceSource({ name, type, description: desc || undefined });
        setCreateOpen(false);
        setName("");
        setType("dictionary");
        setDesc("");
        refetch();
        addToast({ type: "success", message: t("messages.source_created") });
      } catch {
        addToast({ type: "error", message: t("messages.source_create_failed") });
      } finally {
        setCreating(false);
      }
    },
    [name, type, desc, refetch, addToast]
  );

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
  }, []);

  const handleFileUpload = useCallback(
    async (sourceId: number, file: File) => {
      setUploadingId(sourceId);
      try {
        await importReferenceEntries(sourceId, file);
        refetch();
        addToast({ type: "success", message: t("messages.csv_imported") });
      } catch {
        addToast({ type: "error", message: t("messages.import_failed") });
      } finally {
        setUploadingId(null);
      }
    },
    [refetch, addToast]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t("nav.admin"), href: "/admin" }, { label: t("admin.references.title") }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">{t("admin.references.title")}</h1>
        <Button onClick={() => setCreateOpen(true)}>{t("admin.references.add_source")}</Button>
      </div>

      <div className="space-y-4">
        {sources?.map((source) => (
          <Card key={source.id}>
            <CardHeader>
              <div>
                <CardTitle>{source.name}</CardTitle>
                {source.description && (
                  <p className="mt-1 text-[13px] text-text-muted">
                    {source.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-text-muted">
                  {source.entry_count ?? 0} {t("admin.references.entries")}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  loading={uploadingId === source.id}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".csv";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleFileUpload(source.id, file);
                    };
                    input.click();
                  }}
                >
                  {t("admin.references.import_csv")}
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {sources.length === 0 && (
        <p className="py-8 text-center text-[13px] text-text-muted">
          {t("admin.references.no_references")}
        </p>
      )}

      {lastPage > 1 && (
        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          onPageChange={handlePageChange}
        />
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t("admin.references.add_source_title")}
      >
        <form onSubmit={handleCreate} className="space-y-4">
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
          <Input
            label={t("admin.references.description")}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={t("admin.references.desc_placeholder")}
          />
          <Button type="submit" loading={creating} className="w-full">
            {t("admin.references.create_source")}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
