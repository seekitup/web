import { useCallback, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { LinkResponseDto } from "@/types/api";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import {
  formatMeliPrice,
  getLinkDisplayTitle,
  getLinkMediaFiles,
  getLinkSourceText,
} from "@/lib/linkUtils";

interface MercadoLibreGridCardProps {
  link: LinkResponseDto;
  index: number;
  itemId?: string;
  actionSlot?: ReactNode;
}

/**
 * Portrait grid card for MercadoLibre product links. Uses a div+role="link"
 * (not <a>) so the action slot's button can be clicked without triggering
 * navigation. White product hero, brand logo top-left, premium yellow price
 * chip bottom-right. Same aspect-[3/4] / flex-[3]+flex-[2] geometry as the
 * other grid cards.
 */
export function MercadoLibreGridCard({
  link,
  index,
  itemId,
  actionSlot,
}: MercadoLibreGridCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const openLink = useCallback(() => {
    window.open(link.url, "_blank", "noopener,noreferrer");
  }, [link.url]);

  const handleCardClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if ((e.target as Element | null)?.closest("button")) return;
      openLink();
    },
    [openLink],
  );
  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      if ((e.target as Element | null)?.closest("button")) return;
      e.preventDefault();
      openLink();
    },
    [openLink],
  );
  const handleCardAuxClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (e.button !== 1) return;
      if ((e.target as Element | null)?.closest("button")) return;
      e.preventDefault();
      openLink();
    },
    [openLink],
  );

  const title = link.productName?.trim() || getLinkDisplayTitle(link);
  const sourceText = getLinkSourceText(link);
  const price = formatMeliPrice(link.productPrice, link.productPriceCurrency);
  const brand = link.productBrand?.trim();
  const primaryImage = getLinkMediaFiles(link)[0];

  return (
    <motion.div
      role="link"
      tabIndex={0}
      aria-label={`${title} on MercadoLibre`}
      onClick={handleCardClick}
      onAuxClick={handleCardAuxClick}
      onKeyDown={handleCardKeyDown}
      data-item-id={itemId}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.25) }}
      className="group relative aspect-square flex flex-col overflow-hidden rounded-2xl bg-surface border border-white/5 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FFE600]/40 hover:shadow-[0_8px_24px_-8px_rgba(255,230,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {/* Product hero — white backdrop, contained product image */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-white p-4">
        {primaryImage?.url ? (
          <>
            {!imageLoaded ? (
              <div className="absolute inset-0 animate-pulse bg-neutral-200" />
            ) : null}
            <img
              src={primaryImage.url}
              alt={title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`h-full w-full object-contain transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          <ImagePlaceholder size="full" />
        )}

        {/* MercadoLibre logo badge */}
        <span className="absolute top-2 left-2 flex items-center rounded bg-white px-1.5 py-1 shadow-md ring-1 ring-black/5">
          <img
            src="/mercadolibre-logo.png"
            alt="MercadoLibre"
            className="block h-3 w-auto"
          />
        </span>

        {/* Premium price chip — the visual centerpiece */}
        {price ? (
          <span className="absolute bottom-3 right-3 rounded-lg bg-gradient-to-br from-[#FFE600] to-[#FFD000] px-3 py-1.5 text-sm font-extrabold text-[#2E3172] shadow-lg shadow-yellow-500/30 ring-1 ring-black/5">
            {price}
          </span>
        ) : null}
      </div>

      {/* Info — fixed height, no slack */}
      <div className="flex shrink-0 flex-col bg-surface">
        {brand ? (
          <span className="truncate px-3 pt-2 text-[10px] font-medium uppercase tracking-wider text-white/50">
            {brand}
          </span>
        ) : null}
        <h3 className="truncate px-3 pt-2.5 pb-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-primary-light">
          {title}
        </h3>
        <div className="flex items-center justify-center border-t border-white/5 px-3 py-2">
          <span className="truncate text-[11px] text-white/40">
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
    </motion.div>
  );
}
