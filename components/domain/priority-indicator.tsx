import type { Concept } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

interface PriorityIndicatorProps {
  priority: Concept["priority"];
  showLabel?: boolean;
}

const priorityConfig = {
  critical: {
    label: "Critical",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dotClassName: "bg-red-500",
  },
  urgent: {
    label: "Urgent",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    dotClassName: "bg-orange-500",
  },
  high: {
    label: "High",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dotClassName: "bg-amber-500",
  },
  normal: {
    label: "Normal",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    dotClassName: "bg-blue-500",
  },
  low: {
    label: "Low",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    dotClassName: "bg-gray-500",
  },
};

export function PriorityIndicator({
  priority,
  showLabel = false,
}: PriorityIndicatorProps) {
  const config = priorityConfig[priority];

  if (showLabel) {
    return (
      <span className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        config.className
      )}>
        <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClassName)} />
        {config.label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "h-2 w-2 rounded-full",
        config.dotClassName
      )}
      title={config.label}
    />
  );
}
