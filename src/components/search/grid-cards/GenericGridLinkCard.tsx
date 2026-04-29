import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { LinkResponseDto } from "@/types/api";
import { Favicon } from "@/components/ui/Favicon";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ProgressiveMedia } from "@/components/ui/ProgressiveMedia";
import {
  extractYouTubeVideoId,
  formatLinkPrice,
  getLinkDisplayTitle,
  getLinkFavicon,
  getLinkPrimaryMedia,
  getLinkSourceText,
  getYouTubeThumbnailUrl,
  isVideoFile,
  isYouTubeLink,
} from "@/lib/linkUtils";

interface GenericGridLinkCardProps {
  link: LinkResponseDto;
  index: number;
  itemId?: string;
  actionSlot?: ReactNode;
}

/**
 * Portrait grid card for generic (non-platform) links. Aspect-[3/4] wrapper
 * with a flex-[3] image hero and flex-[2] info area — uniform height across
 * any row when paired with `auto-rows-fr` on the grid.
 */
export function GenericGridLinkCard({
  link,
  index,
  itemId,
  actionSlot,
}: GenericGridLinkCardProps) {
  const title = getLinkDisplayTitle(link);
  const sourceText = getLinkSourceText(link);
  const favicon = getLinkFavicon(link);
  const primaryMedia = getLinkPrimaryMedia(link);
  const price = formatLinkPrice(link.productPrice, link.productPriceCurrency);

  const youtubeId = isYouTubeLink(link.url)
    ? extractYouTubeVideoId(link.url)
    : null;
  const showPlayBadge =
    !!youtubeId || (!!primaryMedia && isVideoFile(primaryMedia));

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${title} — ${sourceText}`}
      data-item-id={itemId}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.25) }}
      className="group relative aspect-square flex flex-col overflow-hidden rounded-2xl bg-surface border border-white/5 no-underline transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_24px_-8px_rgba(0,255,153,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {/* Hero */}
      <div className="relative flex-1 overflow-hidden bg-surface-light">
        {youtubeId ? (
          <img
            src={getYouTubeThumbnailUrl(youtubeId)}
            alt={title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : primaryMedia ? (
          <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
            <ProgressiveMedia
              file={primaryMedia}
              width="100%"
              height="100%"
              thumbnailOnly
              alt={title}
            />
          </div>
        ) : (
          <ImagePlaceholder size="full" />
        )}

        {/* Bottom legibility scrim */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />

        {showPlayBadge ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 shadow-lg backdrop-blur-sm">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="white"
                aria-hidden="true"
              >
                <polygon points="8,5 20,12 8,19" />
              </svg>
            </div>
          </div>
        ) : null}

        {price ? (
          <span className="absolute bottom-2 left-2 rounded-full bg-primary px-2 py-1 text-xs font-bold text-black shadow-lg">
            {price}
          </span>
        ) : null}
      </div>

      {/* Info — fixed height, no slack */}
      <div className="flex shrink-0 flex-col">
        <h3 className="truncate px-3 pt-2.5 pb-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-primary-light">
          {title}
        </h3>
        <div className="flex items-center justify-center gap-1.5 border-t border-white/5 px-3 py-2">
          <Favicon
            src={favicon?.url}
            domain={link.domain}
            alt={link.domain}
            size={14}
          />
          <span className="truncate text-[11px] text-white/50">
            {sourceText}
          </span>
        </div>
      </div>

      {actionSlot ? (
        <span
          className="absolute top-2 right-2 z-20"
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
