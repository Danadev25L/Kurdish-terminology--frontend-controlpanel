"use client";

import { Badge } from "@/components/ui/badge";
import { formatNumber, timeAgo } from "@/lib/utils/format";
import type { ReviewQueueItem } from "@/lib/api/types";

interface ReviewQueueRowProps {
  item: ReviewQueueItem;
  selected: boolean;
  onToggle: (id: number) => void;
  onClick: (id: number) => void;
}

export function ReviewQueueRow({
  item,
  selected,
  onToggle,
  onClick,
}: ReviewQueueRowProps) {
  return (
    <tr className="border-b border-border hover:bg-surface">
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onToggle(item.id);
          }}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
      </td>
      <td
        className="cursor-pointer px-4 py-3"
        onClick={() => onClick(item.id)}
      >
        <p className="font-semibold text-foreground">
          {item.concept.english_term?.word ?? "Untitled"}
        </p>
      </td>
      <td className="px-4 py-3">
        <Badge>{item.concept.domain?.name ?? "—"}</Badge>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm" dir="rtl">
          {item.leading_candidate?.kurdish_term?.word ?? "—"}
        </p>
      </td>
      <td className="px-4 py-3 text-sm font-medium">
        {item.consensus_score ? formatNumber(item.consensus_score) : "—"}
      </td>
      <td className="px-4 py-3 text-[13px] text-text-muted">{item.vote_count}</td>
      <td className="px-4 py-3">
        {item.close_call && <Badge variant="warning">Close Call</Badge>}
      </td>
      <td className="px-4 py-3 text-[11px] text-text-muted">
        {timeAgo(item.updated_at)}
      </td>
    </tr>
  );
}
