import type { ResultsViewMode } from "@/components/search/ResultsView";

interface ListSkeletonProps {
  mode: ResultsViewMode;
  type: "links" | "collections";
  count?: number;
}

/**
 * Mode-aware loading skeleton: row-shaped placeholders in compact mode,
 * grid-tile shimmer in grid/complete mode (Complete uses larger tiles).
 */
export function ListSkeleton({ mode, type, count = 9 }: ListSkeletonProps) {
  if (mode === "compact") {
    return (
      <ul className="flex flex-col gap-1 px-2">
        {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
          <li
            key={i}
            className="flex items-start gap-3 px-3 py-3"
            aria-hidden="true"
          >
            <span className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-neutral-800/80" />
            <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
              <span
                className="h-3 animate-pulse rounded bg-neutral-800/80"
                style={{ width: `${50 + ((i * 9) % 30)}%` }}
              />
              <span
                className="h-2.5 animate-pulse rounded bg-neutral-800/60"
                style={{ width: `${28 + ((i * 13) % 24)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (mode === "complete" && type === "links") {
    return (
      <div className="space-y-4">
        {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-surface p-4 animate-pulse"
            aria-hidden="true"
          >
            <div className="aspect-video w-full rounded-xl bg-neutral-800/80 mb-4" />
            <div className="h-3 w-2/3 rounded bg-neutral-800/80 mb-2" />
            <div className="h-2.5 w-1/2 rounded bg-neutral-800/60" />
          </div>
        ))}
      </div>
    );
  }

  // grid (and complete-collections fallback)
  const tileHeight = type === "collections" ? "h-[110px]" : "h-[90px]";
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${tileHeight} rounded-xl bg-surface animate-pulse`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
