"use client";

import { useState, useCallback, useRef } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { useRole } from "@/lib/hooks/use-role";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { DiscussionReply } from "./discussion-reply";
import {
  createDiscussion,
  replyToDiscussion,
  addReaction,
  deleteDiscussion,
} from "@/lib/api/discussions";
import type { Discussion } from "@/lib/api/types";


interface PaginatedDiscussions {
  data: Discussion[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

interface DiscussionThreadProps {
  conceptId: string;
}

export function DiscussionThread({ conceptId }: DiscussionThreadProps) {
  const { isAdmin, isDomainHead } = useRole();
  const { user } = useAuth();
  const [newBody, setNewBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: discussionsData, isLoading, refetch } = useApi<PaginatedDiscussions>(
    `/api/v1/concepts/${conceptId}/discussions`
  );

  // Extract discussions array from paginated response
  const discussions = discussionsData?.data ?? [];

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = textareaRef.current?.value.trim() ?? '';

      // Client-side validation (must match API: min 5 characters)
      if (!trimmed) {
        setError("Discussion body cannot be empty.");
        return;
      }
      if (trimmed.length < 5) {
        setError("Discussion must be at least 5 characters.");
        return;
      }

      setSubmitting(true);
      setError(null);
      try {
        await createDiscussion(Number(conceptId), { body: trimmed });
        setNewBody("");
        // Refetch after a small delay to ensure server processed it
        await refetch();
      } catch (err: unknown) {
        // Show error message from API or generic error
        const message = err instanceof Error ? err.message : "Failed to post discussion.";
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
    [conceptId, refetch]
  );

  // Clear error when user starts typing
  const handleInputChange = (value: string) => {
    setNewBody(value);
    setError(null); // Always clear error on any input
  };

  const handleReply = useCallback(
    async (discussionId: number, body: string, parentId?: number) => {
      await replyToDiscussion(discussionId, {
        body,
        parent_id: parentId,
      });
      refetch();
    },
    [refetch]
  );

  const handleReact = useCallback(
    async (discussionId: number) => {
      await addReaction(discussionId);
      refetch();
    },
    [refetch]
  );

  const handleDelete = useCallback(
    async (discussionId: number) => {
      await deleteDiscussion(discussionId);
      refetch();
    },
    [refetch]
  );

  if (isLoading) return <Spinner />;

  const topLevel = discussions;

  return (
    <div className="space-y-4">
      {/* New discussion form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          ref={textareaRef}
          value={newBody}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Start a new discussion..."
          rows={3}
        />
        {error && (
          <p className="text-sm text-danger">{error}</p>
        )}
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" loading={submitting} disabled={newBody.trim().length < 5}>
            Post
          </Button>
          <span className="text-[11px] text-text-muted">
            {newBody.trim().length < 5
              ? `${5 - newBody.trim().length} more characters required`
              : `${newBody.trim().length} characters`}
          </span>
        </div>
      </form>

      {/* Thread list */}
      {topLevel.length === 0 ? (
        <p className="py-4 text-center text-[13px] text-text-muted">
          No discussions yet. Start one above.
        </p>
      ) : (
        <div className="space-y-4">
          {topLevel.map((discussion) => (
            <DiscussionReply
              key={discussion.id}
              discussion={discussion}
              canModerate={isAdmin || isDomainHead}
              currentUserId={user?.id}
              onReply={handleReply}
              onReact={handleReact}
              onDelete={handleDelete}
              replies={discussion.replies ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
