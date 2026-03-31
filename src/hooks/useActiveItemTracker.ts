import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Tracks which item (child collection or link) is most visible in the viewport.
 * Uses a single IntersectionObserver on all elements with `data-item-id` attributes.
 * Also derives `visibleLinkId` for backward compatibility with LinkCard YouTube autoplay.
 */
export function useActiveItemTracker(itemIds: string[]) {
  const [observedActiveId, setObservedActiveId] = useState<string | null>(null);
  const [forcedActiveId, setForcedActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const ratioMapRef = useRef<Map<string, number>>(new Map());
  const rafRef = useRef<number | null>(null);
  // Timestamp until which observer changes are suppressed (smooth scroll guard)
  const forcedUntilRef = useRef<number>(0);
  const itemIdsRef = useRef(itemIds);
  itemIdsRef.current = itemIds;

  const flush = useCallback(() => {
    rafRef.current = null;
    const map = ratioMapRef.current;
    let bestId: string | null = null;
    let bestRatio = 0;

    for (const [id, ratio] of map) {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestId = id;
      }
    }

    // If user is at the bottom of the page, snap to the last item
    const ids = itemIdsRef.current;
    const atBottom =
      ids.length > 0 &&
      window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 80;

    if (atBottom) {
      setObservedActiveId(ids[ids.length - 1]);
      return;
    }

    if (bestRatio >= 0.15) {
      setObservedActiveId(bestId);

      // Only clear forced override if the guard window has expired
      if (Date.now() > forcedUntilRef.current) {
        setForcedActiveId(null);
      }
    }
  }, []);

  // Force a specific item active (e.g. on pill click).
  // Suppresses observer overrides for 1.2s to survive smooth scroll animation.
  const forceActive = useCallback((itemId: string) => {
    setForcedActiveId(itemId);
    forcedUntilRef.current = Date.now() + 1200;
  }, []);

  // The effective active item: forced takes priority
  const activeItemId = forcedActiveId ?? observedActiveId;

  useEffect(() => {
    // Clean up previous observer
    observerRef.current?.disconnect();
    ratioMapRef.current.clear();

    if (itemIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.itemId;
          if (id) {
            ratioMapRef.current.set(id, entry.intersectionRatio);
          }
        }
        // Batch state updates to one per animation frame
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(flush);
        }
      },
      {
        threshold: [0, 0.15, 0.25, 0.5, 0.75, 1.0],
        // Account for sticky navbar (h-14 = 56px) + navigator (~68px)
        rootMargin: '-124px 0px 0px 0px',
      },
    );

    observerRef.current = observer;

    // Observe all elements with data-item-id
    const elements = document.querySelectorAll<HTMLElement>('[data-item-id]');
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [itemIds, flush]);

  // Re-observe when new items appear in the DOM (e.g. infinite scroll)
  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;

    // Re-query and observe any new elements
    const elements = document.querySelectorAll<HTMLElement>('[data-item-id]');
    elements.forEach((el) => observer.observe(el));
  }, [itemIds]);

  // Trigger flush on scroll so "at bottom" detection works even without intersection changes
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(flush);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [flush]);

  // Derive visibleLinkId for backward compat
  const visibleLinkId = activeItemId?.startsWith('link-')
    ? parseInt(activeItemId.replace('link-', ''), 10)
    : null;

  // Keep the old handleVisibilityChange interface working for LinkCard
  const handleVisibilityChange = useCallback((_linkId: number, _inView: boolean) => {
    // No-op: active tracking is now handled by the IntersectionObserver above
  }, []);

  return { activeItemId, visibleLinkId, handleVisibilityChange, forceActive };
}
