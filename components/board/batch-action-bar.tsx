"use client";

import { Button } from "@/components/ui/button";

interface BatchActionBarProps {
  selectedCount: number;
  onApprove: () => void;
  onClear: () => void;
  loading?: boolean;
}

export function BatchActionBar({
  selectedCount,
  onApprove,
  onClear,
  loading,
}: BatchActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg bg-primary-light px-4 py-3">
      <span className="text-sm font-medium text-primary-500">
        {selectedCount} selected
      </span>
      <Button size="sm" onClick={onApprove} loading={loading}>
        Approve Selected
      </Button>
      <Button size="sm" variant="ghost" onClick={onClear}>
        Clear selection
      </Button>
    </div>
  );
}
