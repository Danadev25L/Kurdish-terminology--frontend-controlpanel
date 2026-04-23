"use client";

import { useState, useCallback } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { useRole } from "@/lib/hooks/use-role";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  exportConcepts,
  exportDomainCSV,
  exportPublicTermsCSV,
  importConceptsCSV,
  importConceptsJSON,
  downloadImportTemplateURL,
  type ExportFormat,
  type ExportFilters,
} from "@/lib/api/exports";
import { getDomains } from "@/lib/api/domains";
import type { Domain, ImportResult } from "@/lib/api/types";
import { RoleGate } from "@/components/auth/role-gate";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useI18n } from "@/i18n/context";

const FILE_EXTENSIONS: Record<ExportFormat, string> = {
  json: "json",
  csv: "csv",
  pdf: "pdf",
};

export default function ExportImportPage() {
  const { isDomainHead, isAdmin } = useRole();
  const { t } = useI18n();
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const { data: domains } = useApi<Domain[]>("/api/v1/domains");

  const handleExport = useCallback(
    async (id: string, format: ExportFormat, filters?: ExportFilters) => {
      setExporting(id);
      try {
        const blob = await exportConcepts(format, filters);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ktp_concepts_export_${new Date().toISOString().split("T")[0]}.${FILE_EXTENSIONS[format]}`;
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

  const handleDomainExport = useCallback(
    async (domain: Domain) => {
      const id = `domain-${domain.id}`;
      setExporting(id);
      try {
        const blob = await exportDomainCSV(domain.id);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ktp_domain_${domain.slug}_${new Date().toISOString().split("T")[0]}.csv`;
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

  const handlePublicTermsExport = useCallback(async () => {
    setExporting("public-terms");
    try {
      const blob = await exportPublicTermsCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ktp_public_terms_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(null);
    }
  }, []);

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
          errors: [{ row: 0, error: err instanceof Error ? err.message : t("messages.import_failed") }],
        });
      } finally {
        setImporting(false);
      }
    },
    [selectedFile, selectedDomain, t]
  );

  const downloadTemplate = useCallback((format: "csv" | "json") => {
    window.open(downloadImportTemplateURL(format), "_blank");
  }, []);

  if (!isDomainHead && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-text-muted">{t("common.no_results")}</p>
      </div>
    );
  }

  const exportItems: {
    id: string;
    title: string;
    description: string;
    format: ExportFormat;
    icon: React.ReactNode;
  }[] = [
    {
      id: "concepts-json",
      title: t("export.all_concepts_json"),
      description: t("export.all_concepts_json_desc"),
      format: "json",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
    },
    {
      id: "concepts-csv",
      title: t("export.all_concepts_csv"),
      description: t("export.all_concepts_csv_desc"),
      format: "csv",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      ),
    },
    {
      id: "concepts-pdf",
      title: t("export.all_concepts_pdf"),
      description: t("export.all_concepts_pdf_desc"),
      format: "pdf",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t("nav.dashboard"), href: "/dashboard" }, { label: t("export.title") }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">
            {t("export.title")}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {t("export.data_backup_desc")}
          </p>
        </div>
        <Button onClick={() => setImportOpen(true)}>
          {t("export.import_concepts")}
        </Button>
      </div>

      {/* Export Formats */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-text-muted uppercase tracking-wider">
          {t("export.export_data")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {exportItems.map((item) => (
            <Card key={item.id} className="group cursor-pointer hover:shadow-md transition-shadow" padding={false}>
              <button
                className="w-full text-left p-4"
                onClick={() => handleExport(item.id, item.format)}
                disabled={exporting !== null}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  </div>
                  {exporting === item.id && (
                    <svg className="h-4 w-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-text-muted">{item.description}</p>
              </button>
            </Card>
          ))}
        </div>
      </div>

      {/* Public Terms Export */}
      <Card padding={false}>
        <button
          className="w-full text-left p-4 flex items-center gap-3 hover:bg-surface transition-colors"
          onClick={handlePublicTermsExport}
          disabled={exporting !== null}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-50 text-success-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 003 12c0-1.97.633-3.792 1.712-5.272" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">{t("export.public_terms_csv")}</h3>
            <p className="text-xs text-text-muted">{t("export.public_terms_csv_desc")}</p>
          </div>
          {exporting === "public-terms" && (
            <svg className="h-4 w-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </button>
      </Card>

      {/* Domain Exports */}
      {domains && domains.length > 0 && (
        <RoleGate roles={["admin", "domain_head"]}>
          <div>
            <h2 className="mb-4 text-sm font-semibold text-text-muted uppercase tracking-wider">
              {t("export.export_by_domain")}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {domains.map((domain) => (
                <Card key={domain.id} padding={false}>
                  <button
                    className="w-full text-left p-3 flex items-center gap-3 hover:bg-surface transition-colors"
                    onClick={() => handleDomainExport(domain)}
                    disabled={exporting !== null}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 text-xs font-bold">
                      {domain.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{domain.name}</p>
                      <p className="text-xs text-text-muted">CSV</p>
                    </div>
                    {exporting === `domain-${domain.id}` && (
                      <svg className="h-4 w-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                  </button>
                </Card>
              ))}
            </div>
          </div>
        </RoleGate>
      )}

      {/* Import Modal */}
      <Modal open={importOpen} onClose={() => setImportOpen(false)} title={t("export.import_concepts")}>
        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t("export.select_file")}
            </label>
            <Input
              type="file"
              accept=".csv,.json"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              required
            />
            <p className="mt-1 text-xs text-text-muted">
              {t("export.download_template_msg")}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => downloadTemplate("csv")}
            >
              {t("export.download_csv_template")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => downloadTemplate("json")}
            >
              {t("export.download_json_template")}
            </Button>
          </div>

          {domains && domains.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {t("export.target_domain")}
              </label>
              <select
                className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground"
                value={selectedDomain ?? ""}
                onChange={(e) => setSelectedDomain(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">{t("export.auto_detect")}</option>
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
                  ? "bg-success-50 text-success-700"
                  : "bg-danger-50 text-danger-700"
              }`}
            >
              {importResult.success ? (
                <p>
                  {t("export.import_success", { imported: importResult.imported, failed: importResult.failed })}
                </p>
              ) : (
                <p>
                  {t("export.import_failed", { failed: importResult.failed })}
                  {importResult.errors && importResult.errors.length > 0 && (
                    <ul className="mt-2 text-sm">
                      {importResult.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>
                          {t("export.import_error_row", { row: err.row, error: err.error })}
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
              {t("common.cancel")}
            </Button>
            <Button type="submit" loading={importing} disabled={!selectedFile}>
              {t("export.import")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
