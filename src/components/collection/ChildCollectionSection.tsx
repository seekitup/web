import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import type {
  LookupChildCollectionDto,
  CollectionLookupResponseDto,
} from "@/types/api";
import { ExpandedSubcollection } from "@/components/collection/ExpandedSubcollection";
import { CompactSubcollection } from "@/components/collection/CompactSubcollection";
import { fromLookupChild } from "@/lib/collectionDisplay";

interface ChildCollectionSectionProps {
  childCollections: LookupChildCollectionDto[];
  parentCollection: CollectionLookupResponseDto;
  view: "list" | "grid";
}

export function ChildCollectionSection({
  childCollections,
  parentCollection,
  view,
}: ChildCollectionSectionProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  const parentUsername = parentCollection.user.username;
  const displayChildren = useMemo(
    () => childCollections.map((c) => fromLookupChild(c, parentUsername)),
    [childCollections, parentUsername],
  );

  if (childCollections.length === 0) return null;

  return (
    <div className="px-4 mb-4">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left py-2 group cursor-pointer"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-neutral-500 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="text-neutral-400 text-sm font-medium">
          {t("childCollections.title")}
        </span>
        <span className="text-neutral-600 text-xs">
          ({childCollections.length})
        </span>
      </button>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {view === "list" ? (
              /* Expanded view: each subcollection as a horizontal scroll section */
              <div className="pt-1">
                {displayChildren.map((child, i) => (
                  <ExpandedSubcollection
                    key={child.id}
                    collection={child}
                    index={i}
                    itemId={`collection-${child.id}`}
                  />
                ))}
              </div>
            ) : (
              /* Grid view: compact 2x2 thumbnail cards */
              <div className="grid grid-cols-2 gap-3 pt-1 pb-2">
                {displayChildren.map((child, i) => (
                  <CompactSubcollection
                    key={child.id}
                    collection={child}
                    index={i}
                    itemId={`collection-${child.id}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
