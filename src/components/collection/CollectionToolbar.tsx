import { useEffect, useState } from "react";
import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { ResultsViewModeToggle } from "@/components/search/ResultsView";
import type { ResultsViewMode } from "@/components/search/resultsViewMode";

interface CollectionToolbarProps {
  mode: ResultsViewMode;
  onModeChange: (next: ResultsViewMode) => void;
  /** Collection name shown on the left once the hero has scrolled out of view. */
  collectionName?: string;
  className?: string;
}

const HERO_SCROLL_THRESHOLD = 160;
const EASING = [0.22, 1, 0.36, 1] as const;

/**
 * Sticky toolbar that sits below the hero. Hosts the 3-mode density toggle
 * (Compact / Grid / Complete) on the right, and fades in the collection name
 * on the left once the hero has scrolled past `HERO_SCROLL_THRESHOLD`. Sticks
 * to `top-16` (under the 64px app navbar).
 */
export function CollectionToolbar({
  mode,
  onModeChange,
  collectionName,
  className,
}: CollectionToolbarProps) {
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () =>
      setScrolled(window.scrollY > HERO_SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: EASING };

  return (
    <div
      className={clsx(
        "sticky top-16 z-30 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-200",
        scrolled
          ? "border-neutral-800/80 bg-background/80 backdrop-blur-xl shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]"
          : "border-neutral-800/40 bg-background/85 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <motion.h2
          className="min-w-0 truncate text-base font-semibold text-text"
          aria-hidden={!scrolled || !collectionName}
          animate={{
            opacity: scrolled && collectionName ? 1 : 0,
            x: scrolled && collectionName ? 0 : -4,
          }}
          transition={transition}
        >
          {collectionName ?? ""}
        </motion.h2>
        <ResultsViewModeToggle mode={mode} onChange={onModeChange} />
      </div>
    </div>
  );
}
