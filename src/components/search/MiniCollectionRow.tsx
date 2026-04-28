import { memo } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import type { CollectionResponseDto } from "@/types/api";
import { useAuth } from "@/hooks/useAuth";
import { CollectionsIcon } from "@/components/layout/nav/icons";
import { HighlightedText } from "@/components/ui/HighlightedText";
import { OwnershipChip } from "@/components/create/OwnershipChip";
import { getCollectionOwnership } from "@/lib/ownership";

interface MiniCollectionRowProps {
  collection: CollectionResponseDto;
  onClick: (collection: CollectionResponseDto) => void;
  highlightQuery?: string | undefined;
  className?: string | undefined;
}

export const MiniCollectionRow = memo<MiniCollectionRowProps>(
  function MiniCollectionRow({
    collection,
    onClick,
    highlightQuery,
    className,
  }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const ownership = getCollectionOwnership(collection, user?.id);

    return (
      <button
        type="button"
        onClick={() => onClick(collection)}
        className={clsx(
          "group flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-white/[0.04] focus-visible:bg-white/[0.04] focus-visible:outline-none rounded-lg cursor-pointer",
          className,
        )}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-neutral-800">
          <CollectionsIcon
            width={20}
            height={20}
            className="text-text-dim/80"
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <HighlightedText
              text={collection.name}
              highlight={highlightQuery}
              className="text-[15px] font-semibold leading-snug text-text group-hover:text-primary-light transition-colors"
              clamp="line-clamp-1"
            />
            {ownership !== "own" ? (
              <OwnershipChip ownership={ownership} className="shrink-0" />
            ) : null}
          </div>
          {collection.description ? (
            <HighlightedText
              text={collection.description}
              highlight={highlightQuery}
              className="mt-0.5 block text-[13px] leading-snug text-text-dim"
              clamp="line-clamp-1"
            />
          ) : (
            <span className="mt-0.5 block text-[13px] leading-snug text-text-dim/70">
              {t("searchScreen.linkCount", { count: collection.totalLinks })}
            </span>
          )}
        </div>
      </button>
    );
  },
);
