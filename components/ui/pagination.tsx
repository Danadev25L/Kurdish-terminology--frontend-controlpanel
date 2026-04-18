"use client";

import { cn } from "@/lib/utils/cn";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  lastPage,
  onPageChange,
}: PaginationProps) {
  if (lastPage <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= lastPage; i++) {
    if (
      i === 1 ||
      i === lastPage ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        Prev
      </button>
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-muted">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              page === currentPage
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= lastPage}
        className="rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        Next
      </button>
    </nav>
  );
}
