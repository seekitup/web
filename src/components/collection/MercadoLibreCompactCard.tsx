import { useCallback, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { LinkResponseDto } from "@/types/api";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PendingMediaSkeleton } from "@/components/ui/PendingMediaSkeleton";
import {
  isLinkPendingMedia,
  usePendingLinkPolling,
} from "@/hooks/usePendingLinkPolling";
import {
  formatMeliPrice,
  getLinkDisplayTitle,
  getLinkMediaFiles,
  getLinkSourceText,
} from "@/lib/linkUtils";

interface MercadoLibreCompactCardProps {
  link: LinkResponseDto;
  index: number;
  itemId?: string;
  actionSlot?: ReactNode;
}

/**
 * Compact (Grid-mode) variant of the MercadoLibre product card. Shares the
 * 90px horizontal geometry of `CompactLinkCard` but the 90×90 cell renders
 * the primary product image on a white backdrop (so transparent cutouts read)
 * with a small Meli logo badge, and the price uses the brand-yellow pill +
 * `formatMeliPrice` formatter shared with `LinkCard`.
 */
export function MercadoLibreCompactCard({
  link: linkProp,
  index,
  itemId,
  actionSlot,
}: MercadoLibreCompactCardProps) {
  // Defensive polling: in practice the dispatcher's `productPrice > 0` gate
  // means this variant only mounts post-scrape, so `isPending` will almost
  // always be false. Kept for parity and to handle direct mounts.
  const link = usePendingLinkPolling(linkProp);
  const isPending = isLinkPendingMedia(link);

  const [imageLoaded, setImageLoaded] = useState(false);

  // Card-level navigation. Wrapper is a div (not <a>) so inner buttons
  // (action slot) can be clicked without triggering link navigation.
  const handleCardClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if ((e.target as Element | null)?.closest("button")) return;
      window.open(link.url, "_blank", "noopener,noreferrer");
    },
    [link.url],
  );
  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      if ((e.target as Element | null)?.closest("button")) return;
      e.preventDefault();
      window.open(link.url, "_blank", "noopener,noreferrer");
    },
    [link.url],
  );
  const handleCardAuxClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (e.button !== 1) return;
      if ((e.target as Element | null)?.closest("button")) return;
      e.preventDefault();
      window.open(link.url, "_blank", "noopener,noreferrer");
    },
    [link.url],
  );

  const title = link.productName?.trim() || getLinkDisplayTitle(link);
  const sourceText = getLinkSourceText(link);
  const price = formatMeliPrice(link.productPrice, link.productPriceCurrency);
  const primaryImage = getLinkMediaFiles(link)[0];

  return (
    <motion.div
      role="link"
      tabIndex={0}
      aria-label={title}
      onClick={handleCardClick}
      onAuxClick={handleCardAuxClick}
      onKeyDown={handleCardKeyDown}
      data-item-id={itemId}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.25) }}
      className="flex bg-surface rounded-xl overflow-hidden hover:scale-[1.01] hover:brightness-110 transition-all duration-200 no-underline group h-[90px] relative cursor-pointer"
    >
      {/* Product image cell — white backdrop so transparent product cutouts read */}
      <div className="w-[90px] h-[90px] shrink-0 relative overflow-hidden bg-white">
        {isPending ? (
          <PendingMediaSkeleton className="absolute inset-0" size="small" />
        ) : primaryImage ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-neutral-200" />
            )}
            <img
              src={primaryImage.url}
              alt={title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          <ImagePlaceholder size="compact" />
        )}
        {/* MercadoLibre logo badge */}
        <span className="absolute top-1 left-1 bg-white rounded px-1 py-0.5 shadow-sm">
          <img
            src="/mercadolibre-logo.png"
            alt="MercadoLibre"
            className="h-2.5 w-auto block"
          />
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
        <h3 className="text-white text-sm font-semibold leading-snug line-clamp-2 mb-1 group-hover:text-primary-light transition-colors">
          {title}
        </h3>
        {price && (
          <span className="text-xs font-bold text-[#2E3172] mb-1 self-start bg-[#FFE600] px-2 py-0.5 rounded-full">
            {price}
          </span>
        )}
        <div className="flex items-center gap-1.5 mt-auto">
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
    </motion.div>
  );
}
