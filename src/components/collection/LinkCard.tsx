import { useEffect, useRef, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import type { LinkResponseDto } from "@/types/api";
import { Favicon } from "@/components/ui/Favicon";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { YouTubeEmbed } from "@/components/collection/YouTubeEmbed";
import { VideoPlayer } from "@/components/collection/VideoPlayer";
import { MercadoLibreHeroCard } from "@/components/collection/MercadoLibreHeroCard";
import { LinkedInHeroCard } from "@/components/collection/LinkedInHeroCard";
import {
  getLinkDisplayTitle,
  getLinkPrimaryMedia,
  getLinkPrimaryVideo,
  getLinkFavicon,
  getLinkSourceText,
  getLinkMediaFiles,
  formatLinkPrice,
  formatMeliPrice,
  isMercadoLibreProduct,
  isLinkedInProfile,
  isYouTubeLink,
  isYouTubeShort,
  extractYouTubeVideoId,
  getVideoThumbnailUrl,
} from "@/lib/linkUtils";

interface LinkCardProps {
  link: LinkResponseDto;
  index: number;
  isVisible: boolean;
  onVisibilityChange: (linkId: number, inView: boolean) => void;
  itemId?: string;
}

export function LinkCard({
  link,
  index,
  isVisible,
  onVisibilityChange,
  itemId,
}: LinkCardProps) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Intersection observer — 50% threshold matching the app
  const { ref: cardRef, inView } = useInView({ threshold: 0.5 });

  useEffect(() => {
    onVisibilityChange(link.id, inView);
  }, [inView, link.id, onVisibilityChange]);

  const title = getLinkDisplayTitle(link);
  const primaryMedia = getLinkPrimaryMedia(link);
  const primaryVideo = getLinkPrimaryVideo(link);
  const favicon = getLinkFavicon(link);
  const sourceText = getLinkSourceText(link);
  const isMeliProduct = isMercadoLibreProduct(link);
  const isLinkedIn = isLinkedInProfile(link);
  const price = isMeliProduct
    ? formatMeliPrice(link.productPrice, link.productPriceCurrency)
    : formatLinkPrice(link.productPrice, link.productPriceCurrency);

  // YouTube
  const youtubeId = isYouTubeLink(link.url)
    ? extractYouTubeVideoId(link.url)
    : null;
  const isShort = youtubeId ? isYouTubeShort(link.url) : false;

  // Get all media files for carousel
  const allMediaFiles = getLinkMediaFiles(link);
  const hasCarousel = !youtubeId && !primaryVideo && allMediaFiles.length > 1;

  // Video thumbnail (poster)
  const videoPoster = primaryVideo
    ? getVideoThumbnailUrl(primaryVideo) || primaryMedia?.url
    : undefined;

  // Track active carousel slide via scroll position
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const slideWidth = el.offsetWidth;
    if (slideWidth === 0) return;
    const newIndex = Math.round(el.scrollLeft / slideWidth);
    setActiveIndex(newIndex);
  }, []);

  const scrollTo = useCallback((idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.offsetWidth, behavior: "smooth" });
  }, []);

  const handleImageLoad = useCallback((key: string) => {
    setLoadedImages((prev) => new Set(prev).add(key));
  }, []);

  // Build carousel items
  const carouselItems: Array<{
    type: "hero" | "media";
    key: string;
    url?: string;
  }> = [];
  if (hasCarousel || isMeliProduct) {
    if (isMeliProduct) {
      carouselItems.push({ type: "hero", key: "meli-hero" });
    }
    for (const file of allMediaFiles.slice(0, 10)) {
      carouselItems.push({
        type: "media",
        key: file.id.toString(),
        url: file.url,
      });
    }
  }

  const totalSlides = carouselItems.length;

  // Determine aspect ratio for carousel/single image
  const aspectRatio =
    primaryMedia?.width && primaryMedia?.height
      ? `${primaryMedia.width} / ${primaryMedia.height}`
      : "16 / 9";

  const motionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: Math.min(index * 0.05, 0.3) },
  };

  // --- Image Section ---
  const imageSection = (
    <div className="relative w-full bg-neutral-800 overflow-hidden">
      {isLinkedIn ? (
        <LinkedInHeroCard link={link} />
      ) : totalSlides > 1 ? (
        // Carousel
        <>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {carouselItems.map((item) =>
              item.type === "hero" ? (
                <div
                  key={item.key}
                  className="w-full shrink-0 snap-center"
                  style={{ aspectRatio }}
                >
                  <MercadoLibreHeroCard mediaFiles={allMediaFiles} />
                </div>
              ) : (
                <div
                  key={item.key}
                  className="w-full shrink-0 snap-center relative"
                  style={{ aspectRatio }}
                >
                  {!loadedImages.has(item.key) && (
                    <div className="absolute inset-0 animate-pulse bg-neutral-700" />
                  )}
                  <img
                    src={item.url}
                    alt=""
                    loading="lazy"
                    onLoad={() => handleImageLoad(item.key)}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                      loadedImages.has(item.key) ? "opacity-100" : "opacity-0"
                    }`}
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
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
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
      ) : youtubeId ? (
        <YouTubeEmbed
          videoId={youtubeId}
          isVisible={isVisible}
          isShort={isShort}
          title={title}
        />
      ) : primaryVideo ? (
        <VideoPlayer
          src={primaryVideo.url}
          poster={videoPoster}
          isVisible={isVisible}
          aspectRatio={aspectRatio}
        />
      ) : primaryMedia?.url ? (
        <>
          {!loadedImages.has("single") && (
            <div className="w-full aspect-video animate-pulse bg-neutral-700" />
          )}
          <img
            src={primaryMedia.url}
            alt={title}
            loading="lazy"
            onLoad={() => handleImageLoad("single")}
            className={`w-full object-cover transition-opacity duration-300 ${
              loadedImages.has("single")
                ? "opacity-100"
                : "opacity-0 absolute inset-0"
            }`}
            style={{ aspectRatio, maxHeight: "400px" }}
          />
        </>
      ) : (
        <div className="w-full aspect-video">
          <ImagePlaceholder size="full" />
        </div>
      )}
    </div>
  );

  // --- Content Section ---
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
        className="block bg-surface rounded-xl overflow-hidden transition-all duration-200 no-underline group"
      >
        {imageSection}
        {contentSection}
      </motion.div>
    );
  }

  // Non-YouTube cards: anchor wrapper for navigation
  return (
    <motion.a
      ref={cardRef}
      data-item-id={itemId}
      {...motionProps}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-surface rounded-xl overflow-hidden transition-all duration-200 no-underline group"
    >
      {imageSection}
      {contentSection}
    </motion.a>
  );
}
