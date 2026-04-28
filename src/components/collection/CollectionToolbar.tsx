import clsx from "clsx";
import { ResultsViewModeToggle } from "@/components/search/ResultsView";
import type { ResultsViewMode } from "@/components/search/resultsViewMode";

interface CollectionToolbarProps {
  mode: ResultsViewMode;
  onModeChange: (next: ResultsViewMode) => void;
  className?: string;
}

/**
 * Sticky toolbar that sits below the hero. Hosts the 3-mode density toggle
 * (Compact / Grid / Complete). Sticks to `top-14` (under the app navbar) so
 * it stays accessible while the user scrolls long collections.
 */
export function CollectionToolbar({
  mode,
  onModeChange,
  className,
}: CollectionToolbarProps) {
  return (
    <div
      className={clsx(
        "sticky top-14 z-30 bg-background/85 backdrop-blur-md",
        "border-b border-neutral-800/40",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <ResultsViewModeToggle mode={mode} onChange={onModeChange} />
        {/* Right slot reserved for a future Sort menu — see plan. */}
        <div />
      </div>
    </div>
  );
}
