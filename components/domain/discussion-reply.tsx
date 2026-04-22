"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { timeAgo } from "@/lib/utils/format";
import type { Discussion, DiscussionReply as DiscussionReplyType } from "@/lib/api/types";

interface DiscussionReplyProps {
  discussion: Discussion | DiscussionReplyType;
  canModerate: boolean;
  currentUserId?: number;
  onReply: (discussionId: number, body: string, parentId?: number) => Promise<void>;
  onReact: (discussionId: number) => Promise<void>;
  onDelete: (discussionId: number) => Promise<void>;
  replies: DiscussionReplyType[];
  depth?: number;
}

export function DiscussionReply({
  discussion,
  canModerate,
  currentUserId,
  onReply,
  onReact,
  onDelete,
  replies,
  depth = 0,
}: DiscussionReplyProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitReply = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = replyBody.trim();

      if (!trimmed) {
        setError("Reply cannot be empty.");
        return;
      }
      if (trimmed.length < 5) {
        setError("Reply must be at least 5 characters.");
        return;
      }

      setSubmitting(true);
      setError(null);
      try {
        await onReply(discussion.id, trimmed, discussion.id);
        setReplyBody("");
        setShowReplyForm(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to post reply.";
        setError(message);
      } finally {
        setSubmitting(false);
      }
    },
    [discussion.id, onReply, replyBody]
  );

  const handleInputChange = useCallback((value: string) => {
    setReplyBody(value);
    if (error) setError(null);
  }, [error]);

  return (
    <div
      className="space-y-2"
      style={{ marginInlineStart: depth > 0 ? "1.5rem" : undefined }}
    >
      <div className="rounded-lg border border-border bg-surface-raised p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-light text-[11px] font-semibold text-primary-500">
              {discussion.author?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <span className="text-sm font-semibold text-foreground">
              {discussion.author?.name ?? "Unknown"}
            </span>
            <span className="text-[11px] text-text-muted">
              {timeAgo(discussion.created_at)}
            </span>
          </div>
          {canModerate && (
            <button
              onClick={() => onDelete(discussion.id)}
              className="text-xs text-danger hover:underline"
              aria-label="Delete comment"
            >
              Delete
            </button>
          )}
        </div>

        <p className="whitespace-pre-wrap text-[13px] text-text-secondary">
          {discussion.body}
        </p>

        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={() => onReact(discussion.id)}
            className="flex items-center gap-1 text-[11px] text-text-muted hover:text-primary"
            aria-label="Like"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48a4.53 4.53 0 01-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
            </svg>
            {"reactions" in discussion && discussion.reactions.upvotes_count > 0 && discussion.reactions.upvotes_count}
          </button>
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-[11px] text-text-muted hover:text-primary"
            aria-label="Reply"
          >
            Reply
          </button>
        </div>

        {showReplyForm && (
          <form onSubmit={handleSubmitReply} className="mt-3 space-y-2">
            <Textarea
              value={replyBody}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
            />
            {error && (
              <p className="text-xs text-danger">{error}</p>
            )}
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                loading={submitting}
                disabled={replyBody.trim().length < 5}
              >
                Reply
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyBody("");
                  setError(null);
                }}
              >
                Cancel
              </Button>
              <span className="ml-auto text-[11px] text-text-muted">
                {replyBody.trim().length < 5
                  ? `${5 - replyBody.trim().length} more required`
                  : `${replyBody.trim().length} chars`}
              </span>
            </div>
          </form>
        )}
      </div>

      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="space-y-2">
          {replies.map((reply) => (
            <DiscussionReply
              key={reply.id}
              discussion={reply}
              canModerate={canModerate}
              currentUserId={currentUserId}
              onReply={onReply}
              onReact={onReact}
              onDelete={onDelete}
              replies={[]}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
