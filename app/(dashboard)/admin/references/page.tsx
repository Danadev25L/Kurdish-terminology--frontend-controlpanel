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

interface PaginatedSources {
  data: ReferenceSource[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

const sourceTypes: { value: ReferenceSourceType; label: string }[] = [
  { value: "academic", label: "Academic" },
  { value: "dictionary", label: "Dictionary" },
  { value: "government", label: "Government" },
  { value: "encyclopedia", label: "Encyclopedia" },
  { value: "journal", label: "Journal" },
  { value: "other", label: "Other" },
];

export default function AdminReferencesPage() {
  const addToast = useToastStore((s) => s.addToast);
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
        addToast({ type: "success", message: "Source created" });
      } catch {
        addToast({ type: "error", message: "Failed to create source" });
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
        addToast({ type: "success", message: "CSV imported" });
      } catch {
        addToast({ type: "error", message: "Import failed" });
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
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "References" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">Reference Library</h1>
        <Button onClick={() => setCreateOpen(true)}>Add Source</Button>
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
                  {source.entry_count ?? 0} entries
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
                  Import CSV
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {sources.length === 0 && (
        <p className="py-8 text-center text-[13px] text-text-muted">
          No reference sources yet.
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
        title="Add Reference Source"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Hazhar Dictionary"
            required
          />
          <Select
            label="Type"
            options={sourceTypes}
            value={type}
            onChange={(e) => setType(e.target.value as ReferenceSourceType)}
            required
          />
          <Input
            label="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Optional description"
          />
          <Button type="submit" loading={creating} className="w-full">
            Create Source
          </Button>
        </form>
      </Modal>
    </div>
  );
}
