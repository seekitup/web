import { memo, type ReactNode } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { CollectionResponseDto } from "@/types/api";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { CollectionsIcon } from "@/components/layout/nav/icons";
import { HighlightedText } from "@/components/ui/HighlightedText";
import { OwnershipChip } from "@/components/create/OwnershipChip";
import { getCollectionOwnership } from "@/lib/ownership";

interface GridCollectionCardProps {
  collection: CollectionResponseDto;
  index: number;
  onClick: (collection: CollectionResponseDto) => void;
  highlightQuery?: string | undefined;
  /** Optional kebab/icon affordance rendered absolutely in the top-right. */
  actionSlot?: ReactNode;
}

const MAX_AVATARS = 3;

export const GridCollectionCard = memo<GridCollectionCardProps>(
  function GridCollectionCard({
    collection,
    index,
    onClick,
    highlightQuery,
    actionSlot,
  }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const ownership = getCollectionOwnership(collection, user?.id);

    const owner = collection.user;
    const renderableMembers = (collection.members ?? []).filter(
      (m): m is typeof m & { username: string } =>
        typeof m?.username === "string" && m.username.length > 0,
    );
    const visibleMembers = renderableMembers
      .filter((m) => !owner || m.id !== owner.id)
      .slice(0, MAX_AVATARS);
    const memberOverflow =
      renderableMembers.length - (owner ? 1 : 0) - visibleMembers.length;

    return (
      <div className="relative">
      <motion.button
        type="button"
        onClick={() => onClick(collection)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.25) }}
        className={clsx(
          "group flex h-[110px] w-full flex-col justify-between rounded-xl bg-surface p-4 text-left transition-all duration-200 hover:scale-[1.01] hover:brightness-110 cursor-pointer",
          actionSlot && "pr-12",
        )}
      >
        <div className="flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-800">
            <CollectionsIcon
              width={18}
              height={18}
              className="text-text-dim group-hover:text-primary transition-colors"
            />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <HighlightedText
                text={collection.name}
                highlight={highlightQuery}
                className="text-[14px] font-semibold leading-snug text-text group-hover:text-primary-light transition-colors"
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
                className="mt-0.5 block text-[12px] leading-snug text-text-dim"
                clamp="line-clamp-1"
              />
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
            {t("searchScreen.linkCount", { count: collection.totalLinks })}
          </span>
          {visibleMembers.length > 0 ? (
            <div className="flex -space-x-2">
              {visibleMembers.map((m) => (
                <span
                  key={m.id}
                  className="ring-2 ring-surface rounded-full"
                  title={m.username}
                >
                  <Avatar user={m} size={20} />
                </span>
              ))}
              {memberOverflow > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-700 px-1 text-[10px] font-semibold text-text-dim ring-2 ring-surface">
                  +{memberOverflow}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </motion.button>
      {actionSlot ? (
        <span className="absolute top-2 right-2 z-10">{actionSlot}</span>
      ) : null}
      </div>
    );
  },
);
