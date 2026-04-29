import clsx from "clsx";
import { useAuth } from "@/hooks/useAuth";
import { CollectionsIcon } from "@/components/layout/nav/icons";
import { getCollectionOwnership } from "@/lib/ownership";
import type { CollectionResponseDto } from "@/types/api";
import { OwnershipChip } from "./OwnershipChip";

interface MiniCollectionProps {
  collection: CollectionResponseDto;
  isSelected: boolean;
  onPress: () => void;
}

export function MiniCollection({
  collection,
  isSelected,
  onPress,
}: MiniCollectionProps) {
  const { user } = useAuth();
  const ownership = getCollectionOwnership(collection, user?.id);

  return (
    <button
      type="button"
      onClick={onPress}
      className={clsx(
        "flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
        isSelected
          ? "border-primary/60 bg-primary/[0.07]"
          : "border-neutral-800 bg-surface-light/30 hover:border-neutral-700",
      )}
    >
      <span
        className={clsx(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
          isSelected ? "bg-primary/15 text-primary" : "bg-neutral-800 text-text-dim",
        )}
      >
        <CollectionsIcon width={14} height={14} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] text-text">
          {collection.name}
        </span>
        <span className="block truncate text-[11px] text-text-dim">
          {collection.totalLinks} {collection.totalLinks === 1 ? "link" : "links"}
        </span>
      </span>
      {ownership && ownership !== "own" ? <OwnershipChip ownership={ownership} /> : null}
      <span
        aria-hidden
        className={clsx(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full transition-colors",
          isSelected ? "bg-primary" : "border-2 border-neutral-600",
        )}
      >
        {isSelected ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-background"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : null}
      </span>
    </button>
  );
}
