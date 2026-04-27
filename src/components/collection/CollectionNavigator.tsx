import { useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { NavigatorPill } from "@/components/collection/NavigatorPill";
import type { NavigatorItem } from "@/components/collection/NavigatorPill";

interface CollectionNavigatorProps {
  items: NavigatorItem[];
  activeItemId: string | null;
  onItemClick: (itemId: string) => void;
  collectionName: string;
  totalLinks: number;
  showCompactTitle: boolean;
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
    transition: { type: "spring" as const, stiffness: 500, damping: 30 },
  },
};

export function CollectionNavigator({
  items,
  activeItemId,
  onItemClick,
  collectionName,
  totalLinks,
  showCompactTitle,
}: CollectionNavigatorProps) {
  const { t } = useTranslation();
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
      activeEl.offsetLeft - containerRect.width / 2 + activeRect.width / 2;

    container.scrollTo({
      left: scrollLeft,
      behavior: "smooth",
    });
  }, [activeItemId]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const hasPills = items.length > 0;

  if (!hasPills && !showCompactTitle) return null;

  return (
    <div className="sticky top-14 z-30 bg-background/90 backdrop-blur-md border-b border-neutral-800/30 mb-6">
      <AnimatePresence initial={false}>
        {showCompactTitle && (
          <motion.div
            key="compact-title"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.28, ease: [0.32, 0.72, 0, 1] },
              opacity: { duration: 0.2 },
            }}
            className="overflow-hidden motion-reduce:transition-none"
          >
            <div className="mx-auto max-w-xl px-4 pt-2.5 pb-0">
              <div
                role="presentation"
                className="flex w-full justify-between items-baseline gap-2 min-w-0"
              >
                <span className="text-base md:text-lg font-semibold text-white truncate leading-tight">
                  {collectionName}
                </span>
                {totalLinks > 0 && (
                  <span className="flex-shrink-0 text-xs md:text-sm font-medium text-neutral-500 leading-tight tabular-nums">
                    {t("common.link", { count: totalLinks })}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasPills && (
        <div className="mx-auto max-w-xl">
          <div
            ref={scrollRef}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            className="overflow-x-auto scrollbar-hide"
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)",
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
      )}
    </div>
  );
}
