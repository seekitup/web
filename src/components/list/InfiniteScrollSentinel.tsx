import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface InfiniteScrollSentinelProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  rootMargin?: string;
  className?: string;
  /**
   * Optional scroll container to observe against. Defaults to the document
   * viewport. Pass when the list scrolls inside an inner element (e.g. a
   * modal with `max-h-[280px] overflow-y-auto`) — without it the sentinel
   * never enters the viewport and `fetchNextPage` won't fire.
   */
  root?: Element | null;
}

/**
 * Renders an invisible sentinel below the list. When it scrolls into view,
 * triggers `fetchNextPage`. Shows a small bouncing-dot loader while fetching.
 *
 * Visual + behavioural parity with the inline pattern in
 * [CollectionPage.tsx](seekitup-web/src/pages/CollectionPage.tsx).
 */
export function InfiniteScrollSentinel({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  rootMargin = "200px 0px",
  className,
  root,
}: InfiniteScrollSentinelProps) {
  const { ref, inView } = useInView({ threshold: 0, rootMargin, root });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!hasNextPage) return null;
  return (
    <div ref={ref} className={className ?? "flex justify-center py-8"}>
      {isFetchingNextPage ? (
        <div className="flex gap-1">
          <div
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      ) : null}
    </div>
  );
}
