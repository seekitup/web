import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { LinkResponseDto } from "@/types/api";
import { Favicon } from "@/components/ui/Favicon";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PendingMediaSkeleton } from "@/components/ui/PendingMediaSkeleton";
import { ProgressiveMedia } from "@/components/ui/ProgressiveMedia";
import {
  isLinkPendingMedia,
  usePendingLinkPolling,
} from "@/hooks/usePendingLinkPolling";
import {
  getLinkDisplayTitle,
  getLinkPrimaryMedia,
  getLinkFavicon,
  getLinkSourceText,
  formatLinkPrice,
  isVideoFile,
  isYouTubeLink,
  extractYouTubeVideoId,
  getYouTubeThumbnailUrl,
  isLinkedInProfile,
  isMercadoLibreProduct,
} from "@/lib/linkUtils";
import { LinkedInCompactCard } from "./LinkedInCompactCard";
import { MercadoLibreCompactCard } from "./MercadoLibreCompactCard";

interface CompactLinkCardProps {
  link: LinkResponseDto;
  index: number;
  itemId?: string;
  /** Optional action affordance rendered in the top-right (e.g. kebab). */
  actionSlot?: ReactNode;
}

/**
 * Canonical Grid-mode link card. Dispatches LinkedIn / MercadoLibre links to
 * their dedicated compact variants (mirrors how `LinkCard` dispatches to the
 * full hero cards in Complete mode), and falls back to a generic 90×90
 * thumbnail + text layout for everything else.
 *
 * The dispatcher polls `usePendingLinkPolling` so dispatch decisions react to
 * fields that arrive after scrape (e.g. `productPrice` flips a Meli link from
 * the generic variant to the Meli variant).
 */
export function CompactLinkCard({
  link: linkProp,
  index,
  itemId,
  actionSlot,
}: CompactLinkCardProps) {
  const link = usePendingLinkPolling(linkProp);

  if (isLinkedInProfile(link)) {
    return (
      <LinkedInCompactCard
        link={link}
        index={index}
        {...(itemId !== undefined ? { itemId } : {})}
        {...(actionSlot !== undefined ? { actionSlot } : {})}
      />
    );
  }
  if (isMercadoLibreProduct(link)) {
    return (
      <MercadoLibreCompactCard
        link={link}
        index={index}
        {...(itemId !== undefined ? { itemId } : {})}
        {...(actionSlot !== undefined ? { actionSlot } : {})}
      />
    );
  }
  return (
    <GenericCompactLinkCard
      link={link}
      index={index}
      {...(itemId !== undefined ? { itemId } : {})}
      {...(actionSlot !== undefined ? { actionSlot } : {})}
    />
  );
}

function GenericCompactLinkCard({
  link: linkProp,
  index,
  itemId,
  actionSlot,
}: CompactLinkCardProps) {
  // Idempotent re-subscribe so this variant always reads the polled link even
  // when reached by callers that didn't pass through the dispatcher. React
  // Query dedupes on `linkKeys.byId(id)`, so no extra request.
  const link = usePendingLinkPolling(linkProp);
  const isPending = isLinkPendingMedia(link);

  const title = getLinkDisplayTitle(link);
  const primaryMedia = getLinkPrimaryMedia(link);
  const favicon = getLinkFavicon(link);
  const sourceText = getLinkSourceText(link);
  const price = formatLinkPrice(link.productPrice, link.productPriceCurrency);

  const youtubeId = isYouTubeLink(link.url)
    ? extractYouTubeVideoId(link.url)
    : null;
  const showPlayBadge =
    !isPending &&
    (!!youtubeId || (!!primaryMedia && isVideoFile(primaryMedia)));

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      data-item-id={itemId}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.25) }}
      className="flex bg-surface rounded-xl overflow-hidden hover:scale-[1.01] hover:brightness-110 transition-all duration-200 no-underline group h-[90px] relative"
    >
      {/* Thumbnail */}
      <div className="w-[90px] h-[90px] shrink-0 relative overflow-hidden">
        {isPending ? (
          <PendingMediaSkeleton className="w-full h-full" size="small" />
        ) : youtubeId ? (
          <img
            src={getYouTubeThumbnailUrl(youtubeId)}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : primaryMedia ? (
          <ProgressiveMedia
            file={primaryMedia}
            width={90}
            height={90}
            thumbnailOnly
            alt={title}
          />
        ) : (
          <ImagePlaceholder size="compact" />
        )}
        {showPlayBadge ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 bg-black/70 rounded-full flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <polygon points="8,5 20,12 8,19" />
              </svg>
            </div>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
        <h3 className="text-white text-sm font-semibold leading-snug line-clamp-2 mb-1 group-hover:text-primary-light transition-colors">
          {title}
        </h3>
        {price && (
          <span className="text-xs font-bold text-primary mb-1 self-start bg-primary/10 px-2 py-0.5 rounded-full">
            {price}
          </span>
        )}
        <div className="flex items-center gap-1.5 mt-auto">
          <Favicon
            src={favicon?.url}
            domain={link.domain}
            alt={link.domain}
            size={12}
          />
          <span className="text-neutral-500 text-xs truncate">
            {sourceText}
          </span>
        </div>
      </div>
      {actionSlot ? (
        <span
          className="absolute top-1.5 right-1.5 z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {actionSlot}
        </span>
      ) : null}
    </motion.a>
  );
}
