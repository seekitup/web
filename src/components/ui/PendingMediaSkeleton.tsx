import clsx from "clsx";

interface PendingMediaSkeletonProps {
  /**
   * Tailwind sizing/aspect classes. Sample values:
   *   "w-full aspect-video"      — LinkCard hero
   *   "w-full h-full"            — compact 90×90 cell, generic grid hero
   *   "h-11 w-11 rounded-lg"     — MiniLinkRow 44×44 thumb
   *   "absolute inset-0"         — fills a positioned slot (grid covers, etc.)
   */
  className?: string;
  /** Dot dimensions: "small" → 4px, "medium" (default) → 6px. */
  size?: "small" | "medium";
}

/**
 * Pulsing neutral surface with two staggered green dots — the visual cue that
 * a link is still being analyzed by the backend scraper. Pair with
 * `usePendingLinkPolling` so the skeleton swaps to the real media automatically
 * once `files[]` populates and the link's status flips to `analyzed`.
 *
 * Animation is pure CSS, so this works anywhere without pulling in
 * framer-motion or a runtime keyframe registry.
 */
export function PendingMediaSkeleton({
  className,
  size = "medium",
}: PendingMediaSkeletonProps) {
  const dotSize = size === "small" ? "h-1 w-1" : "h-1.5 w-1.5";
  return (
    <div
      className={clsx(
        "flex items-center justify-center bg-neutral-700 animate-pulse overflow-hidden",
        className,
      )}
      role="status"
      aria-label="Loading link preview"
    >
      <div className="flex gap-1.5">
        <span
          className={clsx("rounded-full", dotSize)}
          style={{
            backgroundColor: "#00FF99",
            animation: "pendingDotPulse 1s ease-in-out infinite",
          }}
        />
        <span
          className={clsx("rounded-full", dotSize)}
          style={{
            backgroundColor: "#00FF99",
            animation: "pendingDotPulse 1s ease-in-out infinite",
            animationDelay: "0.25s",
          }}
        />
      </div>
      <style>{`
        @keyframes pendingDotPulse {
          0%, 100% { opacity: 0.3; }
          50%      { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
