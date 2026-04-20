import { Badge } from "@/components/ui/badge";

export function CloseCallBanner() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-warning bg-warning-light px-4 py-3">
      <svg
        className="h-5 w-5 shrink-0 text-warning"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
      <div>
        <p className="text-sm font-semibold text-warning">
          Close Call
        </p>
        <p className="text-[11px] text-text-muted">
          The top candidates are within a 5% margin. Review carefully.
        </p>
      </div>
    </div>
  );
}
