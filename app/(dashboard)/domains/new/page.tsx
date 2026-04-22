"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { RoleGate } from "@/components/auth/role-gate";
import { useI18n } from "@/i18n/context";
import { ApiError } from "@/lib/api/client";

export default function NewDomainPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [nameEn, setNameEn] = useState("");
  const [nameKu, setNameKu] = useState("");
  const [slug, setSlug] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionKu, setDescriptionKu] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.post("/api/v1/domains", {
        name: nameEn,
        name_i18n: { ku: nameKu },
        slug: slug || nameEn.toLowerCase().replace(/\s+/g, "-"),
        description: descriptionEn || null,
        description_i18n: { ku: descriptionKu || null },
      });

      router.push("/domains");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to create domain");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">
          Create New Domain
        </h1>
      </div>

      <RoleGate roles={["admin"]}>
        <Card padding>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            {error && (
              <div className="bg-danger/20 border border-danger/50 rounded-lg p-3 text-sm text-danger">
                {error}
              </div>
            )}

            {/* English Name */}
            <div>
              <label htmlFor="nameEn" className="block text-sm font-medium mb-1">
                Domain Name (English) *
              </label>
              <Input
                id="nameEn"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g., Technology"
                required
              />
            </div>

            {/* Kurdish Name */}
            <div>
              <label htmlFor="nameKu" className="block text-sm font-medium mb-1">
                ناوی دۆمەین (کوردی) *
              </label>
              <Input
                id="nameKu"
                value={nameKu}
                onChange={(e) => setNameKu(e.target.value)}
                placeholder="بۆ نموونە: تەکنەلۆجیا"
                required
                dir="rtl"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium mb-1">Slug</label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g., technology (auto-generated if empty)"
              />
              <p className="text-xs text-text-muted mt-1">
                URL-friendly identifier (leave empty to auto-generate)
              </p>
            </div>

            {/* English Description */}
            <div>
              <label htmlFor="descriptionEn" className="block text-sm font-medium mb-1">
                Description (English)
              </label>
              <textarea
                id="descriptionEn"
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="Brief description of this domain..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              />
            </div>

            {/* Kurdish Description */}
            <div>
              <label htmlFor="descriptionKu" className="block text-sm font-medium mb-1">
                وەسفی (کوردی)
              </label>
              <textarea
                id="descriptionKu"
                value={descriptionKu}
                onChange={(e) => setDescriptionKu(e.target.value)}
                placeholder="وەسفی کورت لەم دۆمەینە..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                dir="rtl"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading || !nameEn || !nameKu}>
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Domain"
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </RoleGate>
    </div>
  );
}
