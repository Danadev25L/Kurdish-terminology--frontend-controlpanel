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
import { useI18n } from "@/i18n/context";

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
          errors: [{ row: 0, error: err instanceof Error ? err.message : t("messages.import_failed") }],
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
        title={t("common.no_results")}
        description={t("common.error_generic")}
      />
    );
  }

  const exportItems = [
    {
      id: "concepts-csv",
      title: t("export.all_concepts_csv"),
      description: t("export.all_concepts_csv_desc"),
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
      title: t("export.all_concepts_json"),
      description: t("export.all_concepts_json_desc"),
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
      title: t("export.public_terms_csv"),
      description: t("export.public_terms_csv_desc"),
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      ),
      action: () => handleExport("public-terms", () => exportPublicTermsCSV()),
    },
  ];

  const domainExportItems = domains?.map((domain) => ({
    id: `domain-${domain.id}`,
    title: t("export.domain_csv", { name: domain.name }),
    description: t("export.domain_csv_desc", { name: domain.name }),
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    ),
    action: () => handleExport(`domain-${domain.id}`, () => exportDomainCSV(domain.id)),
  })) ?? [];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t("nav.dashboard"), href: "/dashboard" }, { label: t("export.title") }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("export.title")}</h1>
          <p className="mt-1 text-sm text-muted">
            {t("export.data_backup_desc")}
          </p>
        </div>
        <Button variant="secondary" disabled>{t("export.import_coming_soon")}</Button>
      </div>

      {/* Export Section */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">{t("export.export_data")}</h2>
        <Card>
          <div className="text-center py-8">
            <p className="text-muted">{t("export.export_coming_soon_msg")}</p>
          </div>
        </Card>
      </div>

      {/* Domain Exports */}
      {domains && domains.length > 0 && (
        <RoleGate roles={["admin", "domain-head"]}>
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{t("export.export_by_domain")}</h2>
            <Card>
              <div className="text-center py-8">
                <p className="text-muted">{t("export.domain_coming_soon")}</p>
              </div>
            </Card>
          </div>
        </RoleGate>
      )}

      {/* Import Modal */}
      <Modal open={importOpen} onClose={() => setImportOpen(false)} title={t("export.import_concepts")}>
        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("export.select_file")}
            </label>
            <Input
              type="file"
              accept=".csv,.json"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              required
            />
            <p className="mt-1 text-xs text-muted">
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
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t("export.target_domain")}
              </label>
              <select
                className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm"
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
                  ? "bg-success-light text-success"
                  : "bg-danger-light text-danger"
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
