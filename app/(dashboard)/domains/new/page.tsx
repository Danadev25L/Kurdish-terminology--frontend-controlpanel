"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { RoleGate } from "@/components/auth/role-gate";
import { useI18n } from "@/i18n/context";
import { ApiError } from "@/lib/api/client";

export default function NewDomainPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.post("/api/v1/domains", {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        description: description || null,
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

            <div>
              <Label htmlFor="name">Domain Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Technology"
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
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

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this domain..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading || !name}>
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
                variant="outline"
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
