import {
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import type { FileResponseDto, LinkResponseDto } from "@/types/api";
import { Favicon } from "@/components/ui/Favicon";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ProgressiveMedia } from "@/components/ui/ProgressiveMedia";
import { YouTubeEmbed } from "@/components/collection/YouTubeEmbed";
import { MercadoLibreHeroCard } from "@/components/collection/MercadoLibreHeroCard";
import { LinkedInHeroCard } from "@/components/collection/LinkedInHeroCard";
import { useVideoAudio } from "@/hooks/useVideoAudio";
import {
  getLinkDisplayTitle,
  getLinkCarouselFiles,
  getLinkMediaFiles,
  getLinkFavicon,
  getLinkSourceText,
  formatLinkPrice,
  formatMeliPrice,
  isMercadoLibreProduct,
  isLinkedInProfile,
  isVideoFile,
  isYouTubeLink,
  isYouTubeShort,
  extractYouTubeVideoId,
} from "@/lib/linkUtils";

interface LinkCardProps {
  link: LinkResponseDto;
  index: number;
  isVisible: boolean;
  onVisibilityChange: (linkId: number, inView: boolean) => void;
  itemId?: string;
  /** Optional action affordance rendered floating in the top-right corner. */
  actionSlot?: ReactNode;
}

// Clamp into [9:16, 16:9] so outlier media can't blow out the feed layout.
const ASPECT_RATIO_PORTRAIT = 9 / 16;
const ASPECT_RATIO_LANDSCAPE = 16 / 9;
const clampAspectRatio = (raw: number): number =>
  Math.min(ASPECT_RATIO_LANDSCAPE, Math.max(ASPECT_RATIO_PORTRAIT, raw));

type CarouselItem =
  | { type: "hero"; key: string }
  | { type: "media"; key: string; file: FileResponseDto };

export function LinkCard({
  link,
  index,
  isVisible,
  onVisibilityChange,
  itemId,
  actionSlot,
}: LinkCardProps) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { ref: cardRef, inView } = useInView({ threshold: 0.5 });

  useEffect(() => {
    onVisibilityChange(link.id, inView);
  }, [inView, link.id, onVisibilityChange]);

  // Card-level click navigation. We render the wrapper as a div (not an <a>)
  // so inner buttons (carousel arrows, mute toggle, action slot) can be
  // clicked without triggering anchor navigation. preventDefault on the
  // anchor proved unreliable across browsers/framer-motion, so we navigate
  // imperatively and skip when the click originated on an inner button.
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
  // Middle-click (button 1) opens in a new tab natively on <a>, so we
  // emulate it on the div wrapper.
  const handleCardAuxClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (e.button !== 1) return;
      if ((e.target as Element | null)?.closest("button")) return;
      e.preventDefault();
      window.open(link.url, "_blank", "noopener,noreferrer");
    },
    [link.url],
  );

  const title = getLinkDisplayTitle(link);
  const favicon = getLinkFavicon(link);
  const sourceText = getLinkSourceText(link);
  const isMeliProduct = isMercadoLibreProduct(link);
  const isLinkedIn = isLinkedInProfile(link);
  const price = isMeliProduct
    ? formatMeliPrice(link.productPrice, link.productPriceCurrency)
    : formatLinkPrice(link.productPrice, link.productPriceCurrency);

  const youtubeId = isYouTubeLink(link.url)
    ? extractYouTubeVideoId(link.url)
    : null;
  const isShort = youtubeId ? isYouTubeShort(link.url) : false;

  // Videos sorted before images so a video-only link still renders as a
  // single-slide carousel of the video itself.
  const carouselFiles = useMemo(() => getLinkCarouselFiles(link), [link]);
  // Image-only files for the MercadoLibre hero card (which expects images).
  const meliImageFiles = useMemo(() => getLinkMediaFiles(link), [link]);
  const firstMediaFile = carouselFiles[0];

  // Aspect-ratio fallback: when the first media's File record is missing
  // width/height, the slide reports its natural size on load and we re-derive.
  // Tracking the prior file id lets us reset measuredRatio when the carousel
  // swaps in a different first file without the cascading-render lint error.
  const firstMediaId = firstMediaFile?.id ?? null;
  const [measuredFor, setMeasuredFor] = useState<number | null>(firstMediaId);
  const [measuredRatio, setMeasuredRatio] = useState<number | null>(null);
  if (measuredFor !== firstMediaId) {
    setMeasuredFor(firstMediaId);
    setMeasuredRatio(null);
  }
  const handleFirstMediaNaturalSize = useCallback(
    (nw: number, nh: number) => {
      if (nw && nh) setMeasuredRatio(nw / nh);
    },
    [],
  );

  const aspectRatio = useMemo<string>(() => {
    if (isShort) return `${ASPECT_RATIO_PORTRAIT}`;
    if (youtubeId) return `${ASPECT_RATIO_LANDSCAPE}`;
    if (firstMediaFile?.width && firstMediaFile?.height) {
      return `${clampAspectRatio(firstMediaFile.width / firstMediaFile.height)}`;
    }
    if (measuredRatio) return `${clampAspectRatio(measuredRatio)}`;
    return `${ASPECT_RATIO_LANDSCAPE}`;
  }, [isShort, youtubeId, firstMediaFile, measuredRatio]);

  // Build carousel items. MercadoLibre product gets a hero slide prepended.
  const carouselItems = useMemo<CarouselItem[]>(() => {
    const items: CarouselItem[] = [];
    if (isMeliProduct) items.push({ type: "hero", key: "meli-hero" });
    for (const file of carouselFiles.slice(0, 10)) {
      items.push({
        type: "media",
        key: file.id.toString(),
        file,
      });
    }
    return items;
  }, [isMeliProduct, carouselFiles]);

  const totalSlides = carouselItems.length;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const slideWidth = el.offsetWidth;
    if (slideWidth === 0) return;
    setActiveIndex(Math.round(el.scrollLeft / slideWidth));
  }, []);

  const scrollTo = useCallback((idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.offsetWidth, behavior: "smooth" });
  }, []);

  // Active media item (skipping the hero slide if present).
  const activeItem = carouselItems[activeIndex];
  const activeIsVideo =
    activeItem?.type === "media" && isVideoFile(activeItem.file);

  // Single-card mute toggle, shown only when the active slide is a video.
  const { isMuted, toggleMute } = useVideoAudio();
  const handleMuteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMute();
  };

  const motionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: Math.min(index * 0.05, 0.3) },
  };

  // --- Image / media section ---
  const mediaSection = (
    <div className="relative w-full bg-neutral-800 overflow-hidden">
      {isLinkedIn ? (
        <LinkedInHeroCard link={link} />
      ) : youtubeId ? (
        <YouTubeEmbed
          videoId={youtubeId}
          isVisible={isVisible}
          isShort={isShort}
          title={title}
        />
      ) : totalSlides > 1 ? (
        <>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {carouselItems.map((item, i) =>
              item.type === "hero" ? (
                <div
                  key={item.key}
                  className="w-full shrink-0 snap-center"
                  style={{ aspectRatio }}
                >
                  <MercadoLibreHeroCard mediaFiles={meliImageFiles} />
                </div>
              ) : (
                <div
                  key={item.key}
                  className="w-full shrink-0 snap-center"
                  style={{ aspectRatio }}
                >
                  <ProgressiveMedia
                    file={item.file}
                    width="100%"
                    aspectRatio={aspectRatio}
                    isVisible={isVisible && i === activeIndex}
                    alt={title}
                    {...(i === (isMeliProduct ? 1 : 0)
                      ? { onNaturalSize: handleFirstMediaNaturalSize }
                      : {})}
                  />
                </div>
              ),
            )}
          </div>

          {/* Left caret */}
          {activeIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                scrollTo(activeIndex - 1);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          {/* Right caret */}
          {activeIndex < totalSlides - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                scrollTo(activeIndex + 1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-10"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
          {/* Dots indicator */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {carouselItems.map((item, i) => (
              <div
                key={item.key}
                className={`w-1.5 h-1.5 rounded-full transition-opacity duration-200 ${
                  i === activeIndex
                    ? "bg-white opacity-100"
                    : "bg-white opacity-50"
                }`}
              />
            ))}
          </div>
        </>
      ) : firstMediaFile ? (
        <div style={{ aspectRatio }}>
          <ProgressiveMedia
            file={firstMediaFile}
            width="100%"
            aspectRatio={aspectRatio}
            isVisible={isVisible}
            onNaturalSize={handleFirstMediaNaturalSize}
            alt={title}
          />
        </div>
      ) : (
        <div className="w-full aspect-video">
          <ImagePlaceholder size="full" />
        </div>
      )}

      {/* Mute toggle: shown when the active slide is a playing video. */}
      {activeIsVideo ? (
        <button
          type="button"
          onClick={handleMuteClick}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          aria-pressed={!isMuted}
          className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/75 flex items-center justify-center transition-colors"
        >
          {isMuted ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      ) : null}
    </div>
  );

  // --- Content section ---
  const contentSection = (
    <div className="p-4">
      {isMeliProduct ? (
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-sm font-semibold leading-snug line-clamp-2 mb-2 group-hover:text-primary-light transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-2">
              <Favicon
                src={favicon?.url}
                domain={link.domain}
                alt={link.domain}
                size={14}
              />
              <span className="text-neutral-500 text-xs truncate">
                {sourceText}
              </span>
            </div>
          </div>
          {price && (
            <span className="shrink-0 text-[15px] font-semibold text-[#2E3172] bg-[#FFE600] px-3.5 py-2 rounded-lg">
              {price}
            </span>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-start gap-2 mb-2">
            <h3 className="text-white text-sm font-semibold leading-snug line-clamp-2 flex-1 group-hover:text-primary-light transition-colors">
              {title}
            </h3>
            {price && (
              <span className="shrink-0 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {price}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Favicon
              src={favicon?.url}
              domain={link.domain}
              alt={link.domain}
              size={14}
            />
            <span className="text-neutral-500 text-xs truncate">
              {sourceText}
            </span>
            {youtubeId && (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-neutral-500 hover:text-primary transition-colors ml-auto inline-flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {t("linkCard.watchOnYouTube")}
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );

  // YouTube cards: div wrapper (iframe captures clicks)
  if (youtubeId) {
    return (
      <motion.div
        ref={cardRef}
        data-item-id={itemId}
        {...motionProps}
        className="block bg-surface rounded-xl overflow-hidden transition-all duration-200 no-underline group relative"
      >
        {mediaSection}
        {contentSection}
        {actionSlot ? (
          <span
            className="absolute top-2 right-2 z-10"
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

  return (
    <motion.div
      ref={cardRef}
      data-item-id={itemId}
      {...motionProps}
      role="link"
      tabIndex={0}
      aria-label={title}
      onClick={handleCardClick}
      onAuxClick={handleCardAuxClick}
      onKeyDown={handleCardKeyDown}
      className="block bg-surface rounded-xl overflow-hidden transition-all duration-200 no-underline group relative cursor-pointer"
    >
      {mediaSection}
      {contentSection}
      {actionSlot ? (
        <span
          className="absolute top-2 right-2 z-10"
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
