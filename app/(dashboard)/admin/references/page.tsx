"use client";

import { useState, useCallback, useRef } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { createReferenceSource, importReferenceEntries } from "@/lib/api/references";
import type { ReferenceSource, ReferenceSourceType } from "@/lib/api/types";

const sourceTypes: { value: ReferenceSourceType; label: string }[] = [
  { value: "academic", label: "Academic" },
  { value: "dictionary", label: "Dictionary" },
  { value: "government", label: "Government" },
  { value: "encyclopedia", label: "Encyclopedia" },
  { value: "journal", label: "Journal" },
  { value: "other", label: "Other" },
];

export default function AdminReferencesPage() {
  const { data: sources, isLoading, refetch } = useApi<ReferenceSource[]>(
    "/api/v1/reference-sources"
  );
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
      } finally {
        setCreating(false);
      }
    },
    [name, type, desc, refetch]
  );

  const handleFileUpload = useCallback(
    async (sourceId: number, file: File) => {
      setUploadingId(sourceId);
      try {
        await importReferenceEntries(sourceId, file);
        refetch();
      } finally {
        setUploadingId(null);
      }
    },
    [refetch]
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reference Library</h1>
        <Button onClick={() => setCreateOpen(true)}>Add Source</Button>
      </div>

      <div className="space-y-4">
        {sources?.map((source) => (
          <Card key={source.id}>
            <CardHeader>
              <div>
                <CardTitle>{source.name}</CardTitle>
                {source.description && (
                  <p className="mt-1 text-sm text-muted">
                    {source.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">
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

      {(!sources || sources.length === 0) && (
        <p className="py-8 text-center text-sm text-muted">
          No reference sources yet.
        </p>
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
