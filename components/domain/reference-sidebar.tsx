"use client";

import { useApi } from "@/lib/hooks/use-api";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ExternalLink } from "@/components/ui/external-link";

interface ReferenceEntry {
  id: number;
  english_word: string;
  kurdish_word: string;
  definition: string;
  source_name: string;
  source_url?: string;
}

interface ReferenceSidebarProps {
  conceptId: string;
}

export function ReferenceSidebar({ conceptId }: ReferenceSidebarProps) {
  const { data: entries, isLoading } = useApi<ReferenceEntry[]>(
    `/api/v1/concepts/${conceptId}/reference-entries`
  );

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <Spinner size="sm" />
        </div>
      </Card>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Card>
        <h3 className="mb-3 text-sm font-medium text-text-muted">
          Reference Context
        </h3>
        <p className="text-sm text-text-muted">
          No dictionary definitions found for this term.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-medium text-text-muted">
        Reference Context
      </h3>
      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-lg bg-surface p-3 text-sm"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="font-medium text-foreground">
                {entry.english_word}
              </span>
              {entry.source_url && (
                <ExternalLink
                  href={entry.source_url}
                  className="text-xs text-primary-500 hover:underline"
                >
                  {entry.source_name}
                </ExternalLink>
              )}
            </div>
            <p className="text-text-muted">{entry.kurdish_word}</p>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              {entry.definition}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
