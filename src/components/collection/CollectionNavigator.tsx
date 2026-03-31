import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { NavigatorPill } from '@/components/collection/NavigatorPill';
import type { NavigatorItem } from '@/components/collection/NavigatorPill';

interface CollectionNavigatorProps {
  items: NavigatorItem[];
  activeItemId: string | null;
  onItemClick: (itemId: string) => void;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.025, delayChildren: 0.1 },
  },
};

const pillVariants = {
  hidden: { opacity: 0, scale: 0.7, y: 6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 500, damping: 30 },
  },
};

export function CollectionNavigator({
  items,
  activeItemId,
  onItemClick,
}: CollectionNavigatorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrollingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track user interaction to suppress auto-scroll while user drags
  const onPointerDown = useCallback(() => {
    userScrollingRef.current = true;
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const onPointerUp = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      userScrollingRef.current = false;
    }, 2000);
  }, []);

  // Auto-scroll to center the active pill
  useEffect(() => {
    if (!activeItemId || !scrollRef.current || userScrollingRef.current) return;

    const container = scrollRef.current;
    const activeEl = container.querySelector<HTMLElement>(
      `[data-nav-id="${activeItemId}"]`,
    );
    if (!activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();

    // Calculate offset to center the active element
    const scrollLeft =
      activeEl.offsetLeft -
      containerRect.width / 2 +
      activeRect.width / 2;

    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth',
    });
  }, [activeItemId]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="sticky top-14 z-30 bg-background/90 backdrop-blur-md border-b border-neutral-800/30 mb-6">
      <div className="mx-auto max-w-xl">
        <div
          ref={scrollRef}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className="overflow-x-auto scrollbar-hide"
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)',
          }}
        >
          <motion.div
            className="flex gap-2.5 px-6 py-3 w-max pb-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {items.map((item) => (
              <motion.div key={item.id} variants={pillVariants}>
                <NavigatorPill
                  item={item}
                  isActive={item.id === activeItemId}
                  onClick={() => onItemClick(item.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
