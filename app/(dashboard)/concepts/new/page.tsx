"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createConcept } from "@/lib/api/concepts";
import { getDomains } from "@/lib/api/domains";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ApiError } from "@/lib/api/client";
import type { Domain } from "@/lib/api/types";
import { useI18n } from "@/i18n/context";

export default function NewConceptPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [domainId, setDomainId] = useState("");
  const [englishTerm, setEnglishTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getDomains()
      .then((data) => setDomains(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      await createConcept({
        domain_id: Number(domainId),
        english_term: englishTerm,
        definition,
      });
      router.push("/concepts");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const domainOptions = domains.map((d) => ({
    value: String(d.id),
    label: d.name,
  }));

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t("concepts.title"), href: "/concepts" },
          { label: t("concepts.new_concept") },
        ]}
      />
      <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">
        {t("concepts.new_concept")}
      </h1>

      <Card className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            label={t("concepts.new.domain")}
            options={domainOptions}
            value={domainId}
            onChange={(e) => setDomainId(e.target.value)}
            placeholder={t("concepts.new.domain_placeholder")}
            error={errors.domain_id?.[0]}
            required
          />

          <Input
            label={t("concepts.new.english_term")}
            value={englishTerm}
            onChange={(e) => setEnglishTerm(e.target.value)}
            placeholder={t("concepts.new.english_term_placeholder")}
            error={errors.english_term?.[0]}
            required
            maxLength={200}
          />

          <Textarea
            label={t("concepts.new.definition")}
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            placeholder={t("concepts.new.definition_placeholder")}
            error={errors.definition?.[0]}
            required
            rows={4}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t("concepts.new.creating") : t("concepts.new.create")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
