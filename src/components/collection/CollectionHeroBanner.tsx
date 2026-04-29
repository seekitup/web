import { type Ref } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/components/ui/Avatar";
import { AvatarStack } from "@/components/ui/AvatarStack";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { VisibilityChip } from "@/components/ui/VisibilityChip";
import { MoreIcon, PlusIcon, ShareIcon } from "@/components/ui/icons";
import {
  canAddContent,
  canShareCollection,
  isSharedCollection,
} from "@/lib/permissions";
import type { CollectionResponseDto } from "@/types/api";

interface CollectionHeroBannerProps {
  collection: CollectionResponseDto;
  currentUserId: number | undefined;
  /** First-link primary media URL — used as the ambient blurred backdrop. */
  backdropMediaUrl?: string | undefined;
  /** Forwarded to the title h1 so the page can sense when it scrolls behind the navbar. */
  titleRef?: Ref<HTMLHeadingElement>;
  totalLinks: number;
  totalCollections: number;
  onShare: () => void;
  onAddLink: () => void;
  onOpenOptions: () => void;
}

/**
 * Stunning full-bleed hero for the authenticated collection view. Layers a
 * heavily-blurred copy of the collection's hero image behind a primary-tinted
 * gradient, fades into the page below, and centers a content column with the
 * collection's name, owner, member stack, visibility chip, stats, and action
 * cluster. Falls back to a brand gradient when no media is available.
 */
export function CollectionHeroBanner({
  collection,
  currentUserId,
  backdropMediaUrl,
  titleRef,
  totalLinks,
  totalCollections,
  onShare,
  onAddLink,
  onOpenOptions,
}: CollectionHeroBannerProps) {
  const { t } = useTranslation();
  const { user: owner, members } = collection;
  const otherMembers = (members ?? []).filter((m) => m.user.id !== owner?.id);

  const canAdd = canAddContent(collection, currentUserId);
  const canShare = canShareCollection(collection, currentUserId);
  const shared = isSharedCollection(collection, currentUserId);

  const ownerFullName =
    [owner?.firstName, owner?.lastName].filter(Boolean).join(" ").trim() ||
    owner?.username ||
    "";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full overflow-hidden bg-background"
    >
      {/* Ambient backdrop — only when we have media to feed it. */}
      {backdropMediaUrl ? (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${backdropMediaUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: "scale(1.15)",
            filter: "blur(48px) saturate(1.2)",
            opacity: 0.85,
          }}
        />
      ) : null}

      {/* Primary tint — keeps brand color readable without blanking the image */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none"
      />
      {/* Light dim so the hero text stays legible over busy imagery */}
      <div
        aria-hidden
        className="absolute inset-0 bg-background/35 pointer-events-none"
      />
      {/* Soft top vignette so the navbar doesn't fight the imagery */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/70 to-transparent pointer-events-none"
      />
      {/* Bottom fade-out into the page background */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background pointer-events-none"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-8 md:pt-14 md:pb-10">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <VisibilityChip
                visibility={collection.visibility}
                isShared={shared}
              />
              <span className="text-[12px] text-text-dim">
                {t("collectionHero.linkCount", { count: totalLinks })}
                {totalCollections > 0
                  ? ` · ${t("collectionHero.collectionCount", { count: totalCollections })}`
                  : ""}
              </span>
            </div>
            <h1
              ref={titleRef}
              className="text-3xl md:text-5xl font-bold text-white leading-[1.05] tracking-tight"
            >
              {collection.name}
            </h1>
            {collection.description ? (
              <p className="text-sm md:text-base text-text-dim leading-relaxed mt-3 max-w-2xl line-clamp-3">
                {collection.description}
              </p>
            ) : null}
          </div>

          {/* Action cluster — desktop layout pinned to the right */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {canShare ? (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<ShareIcon size={14} />}
                onClick={onShare}
              >
                {t("collectionHero.share")}
              </Button>
            ) : null}
            {canAdd ? (
              <Button
                variant="outlined"
                size="sm"
                leftIcon={<PlusIcon size={14} />}
                onClick={onAddLink}
              >
                {t("collectionHero.addLink")}
              </Button>
            ) : null}
            <IconButton
              variant="glass"
              aria-label={t("collectionHero.openOptions")}
              onClick={onOpenOptions}
            >
              <MoreIcon />
            </IconButton>
          </div>
        </div>

        {/* People row */}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          {owner ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                user={{
                  id: owner.id,
                  username: owner.username,
                  firstName: owner.firstName,
                  lastName: owner.lastName,
                  image: owner.image
                    ? { id: owner.image.id, url: owner.image.url }
                    : null,
                }}
                size={36}
                className="ring-2 ring-primary/40"
              />
              <div className="min-w-0">
                {ownerFullName ? (
                  <div className="text-sm font-semibold text-white leading-tight truncate">
                    {ownerFullName}
                  </div>
                ) : null}
                <div className="text-[12px] text-text-dim leading-tight truncate">
                  @{owner.username}
                </div>
              </div>
            </div>
          ) : null}

          {otherMembers.length > 1 ? (
            <div className="flex items-center gap-2 min-w-0">
              <AvatarStack
                users={otherMembers.map((m) => ({
                  id: m.user.id,
                  username: m.user.username,
                  firstName: m.user.firstName,
                  lastName: m.user.lastName,
                  image: m.user.image
                    ? { id: m.user.image.id, url: m.user.image.url }
                    : null,
                }))}
                size={28}
                max={5}
                ringClassName="ring-background"
              />
              <span className="text-[12px] text-text-dim">
                {t("collectionHero.memberCount", {
                  count: otherMembers.length,
                })}
              </span>
            </div>
          ) : null}
        </div>

        {/* Mobile-only action row */}
        <div className="mt-5 md:hidden flex items-center gap-2">
          {canShare ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ShareIcon size={14} />}
              onClick={onShare}
              fullWidth
            >
              {t("collectionHero.share")}
            </Button>
          ) : null}
          {canAdd ? (
            <Button
              variant="outlined"
              size="sm"
              leftIcon={<PlusIcon size={14} />}
              onClick={onAddLink}
              fullWidth
            >
              {t("collectionHero.addLink")}
            </Button>
          ) : null}
          <IconButton
            variant="glass"
            aria-label={t("collectionHero.openOptions")}
            onClick={onOpenOptions}
          >
            <MoreIcon />
          </IconButton>
        </div>
      </div>
    </motion.section>
  );
}
