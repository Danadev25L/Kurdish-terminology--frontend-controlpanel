"use client";

import { useState, useCallback } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { useRole } from "@/lib/hooks/use-role";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  exportConceptsCSV,
  exportConceptsJSON,
  exportDomainCSV,
  exportPublicTermsCSV,
  importConceptsCSV,
  importConceptsJSON,
  downloadImportTemplateURL,
} from "@/lib/api/exports";
import { getDomains } from "@/lib/api/domains";
import type { Domain, ImportResult } from "@/lib/api/types";
import { RoleGate } from "@/components/auth/role-gate";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function ExportImportPage() {
  const { isDomainHead, isAdmin } = useRole();
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const { data: domains } = useApi<Domain[]>("/api/v1/domains");

  const handleExport = useCallback(
    async (exportType: string, asyncFn: () => Promise<Blob>) => {
      setExporting(exportType);
      try {
        const blob = await asyncFn();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${exportType}-${new Date().toISOString().split("T")[0]}.${exportType.includes("json") ? "json" : "csv"}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        console.error("Export failed:", err);
      } finally {
        setExporting(null);
      }
    },
    []
  );

  const handleImport = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedFile) return;

      setImporting(true);
      setImportResult(null);
      try {
        let result: ImportResult;
        if (selectedFile.name.endsWith(".json")) {
          result = await importConceptsJSON(selectedFile, selectedDomain ?? undefined);
        } else {
          result = await importConceptsCSV(selectedFile, selectedDomain ?? undefined);
        }
        setImportResult(result);
        if (result.success) {
          setSelectedFile(null);
          setSelectedDomain(null);
        }
      } catch (err) {
        setImportResult({
          success: false,
          imported: 0,
          failed: 0,
          errors: [{ row: 0, error: err instanceof Error ? err.message : "Import failed" }],
        });
      } finally {
        setImporting(false);
      }
    },
    [selectedFile, selectedDomain]
  );

  const downloadTemplate = useCallback((format: "csv" | "json") => {
    window.open(downloadImportTemplateURL(format), "_blank");
  }, []);

  if (!isDomainHead && !isAdmin) {
    return (
      <EmptyState
        title="Access Denied"
        description="You need domain head or admin privileges to access this page."
      />
    );
  }

  const exportItems = [
    {
      id: "concepts-csv",
      title: "All Concepts (CSV)",
      description: "Export all concepts across all domains to CSV format",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      ),
      action: () =>
        handleExport("concepts-csv", () =>
          exportConceptsCSV()
        ),
    },
    {
      id: "concepts-json",
      title: "All Concepts (JSON)",
      description: "Export all concepts with full metadata to JSON format",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      ),
      action: () =>
        handleExport("concepts-json", () =>
          exportConceptsJSON()
        ),
    },
    {
      id: "public-terms",
      title: "Public Terms (CSV)",
      description: "Export all published terms to CSV format",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      ),
      action: () => handleExport("public-terms", () => exportPublicTermsCSV()),
    },
  ];

  const domainExportItems = domains?.map((domain) => ({
    id: `domain-${domain.id}`,
    title: `${domain.name} (CSV)`,
    description: `Export all concepts from ${domain.name} domain`,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    ),
    action: () => handleExport(`domain-${domain.id}`, () => exportDomainCSV(domain.id)),
  })) ?? [];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Export/Import" }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Export & Import</h1>
          <p className="mt-1 text-sm text-muted">
            Export data for backups or import concepts from external sources
          </p>
        </div>
        <Button onClick={() => setImportOpen(true)}>Import Concepts</Button>
      </div>

      {/* Export Section */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Export Data</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exportItems.map((item) => (
            <Card key={item.id} padding>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    {item.icon}
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted">{item.description}</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={item.action}
                    loading={exporting === item.id}
                  >
                    Export
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Domain Exports */}
      {domains && domains.length > 0 && (
        <RoleGate roles={["admin", "domain-head"]}>
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Export by Domain</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {domainExportItems.map((item) => (
                <Card key={item.id} padding>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-light">
                      <svg
                        className="h-5 w-5 text-success"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        {item.icon}
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted">{item.description}</p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-3"
                        onClick={item.action}
                        loading={exporting === item.id}
                      >
                        Export
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </RoleGate>
      )}

      {/* Import Modal */}
      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import Concepts">
        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select File (CSV or JSON)
            </label>
            <Input
              type="file"
              accept=".csv,.json"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              required
            />
            <p className="mt-1 text-xs text-muted">
              Download a template to see the expected format
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => downloadTemplate("csv")}
            >
              Download CSV Template
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => downloadTemplate("json")}
            >
              Download JSON Template
            </Button>
          </div>

          {domains && domains.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Target Domain (Optional)
              </label>
              <select
                className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm"
                value={selectedDomain ?? ""}
                onChange={(e) => setSelectedDomain(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Auto-detect from file</option>
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {importResult && (
            <div
              className={`rounded-lg p-4 ${
                importResult.success
                  ? "bg-success-light text-success"
                  : "bg-danger-light text-danger"
              }`}
            >
              {importResult.success ? (
                <p>
                  Successfully imported {importResult.imported} concepts.
                  {importResult.failed > 0 && ` Failed: ${importResult.failed}`}
                </p>
              ) : (
                <p>
                  Import failed. {importResult.failed} errors occurred.
                  {importResult.errors && importResult.errors.length > 0 && (
                    <ul className="mt-2 text-sm">
                      {importResult.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>
                          Row {err.row}: {err.error}
                        </li>
                      ))}
                    </ul>
                  )}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={importing} disabled={!selectedFile}>
              Import
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
