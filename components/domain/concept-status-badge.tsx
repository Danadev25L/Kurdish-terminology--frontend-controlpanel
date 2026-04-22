import { Badge, type BadgeVariant } from "@/components/ui/badge";
import type { ConceptStatus } from "@/lib/api/types";

const statusConfig: Record<
  ConceptStatus,
  { label: string; variant: BadgeVariant }
> = {
  draft: { label: "Draft", variant: "default" },
  threshold: { label: "Threshold", variant: "warning" },
  voting: { label: "Voting", variant: "primary" },
  review: { label: "Board Review", variant: "primary" },
  published: { label: "Published", variant: "success" },
  recalled: { label: "Recalled", variant: "danger" },
};

interface ConceptStatusBadgeProps {
  status: ConceptStatus;
}

export function ConceptStatusBadge({ status }: ConceptStatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
