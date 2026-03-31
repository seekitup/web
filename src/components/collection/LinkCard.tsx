import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import type { LinkResponseDto } from '@/types/api';
import { Favicon } from '@/components/ui/Favicon';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { YouTubeEmbed } from '@/components/collection/YouTubeEmbed';
import { VideoPlayer } from '@/components/collection/VideoPlayer';
import {
  getLinkDisplayTitle,
  getLinkPrimaryMedia,
  getLinkPrimaryVideo,
  getLinkFavicon,
  getLinkSourceText,
  formatLinkPrice,
  isYouTubeLink,
  isYouTubeShort,
  extractYouTubeVideoId,
  getYouTubeThumbnailUrl,
  getVideoThumbnailUrl,
} from '@/lib/linkUtils';
import { useState } from 'react';

interface LinkCardProps {
  link: LinkResponseDto;
  index: number;
  isVisible: boolean;
  onVisibilityChange: (linkId: number, inView: boolean) => void;
  itemId?: string;
}

export function LinkCard({ link, index, isVisible, onVisibilityChange, itemId }: LinkCardProps) {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);

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
  const price = formatLinkPrice(link.productPrice, link.productPriceCurrency);

  // YouTube
  const youtubeId = isYouTubeLink(link.url) ? extractYouTubeVideoId(link.url) : null;
  const isShort = youtubeId ? isYouTubeShort(link.url) : false;

  // Determine thumbnail for non-YouTube content
  const thumbnailUrl = youtubeId
    ? getYouTubeThumbnailUrl(youtubeId)
    : primaryMedia?.url;

  // Video thumbnail (poster)
  const videoPoster = primaryVideo
    ? getVideoThumbnailUrl(primaryVideo) || primaryMedia?.url
    : undefined;

  const hasImage = !!thumbnailUrl;

  const motionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: Math.min(index * 0.05, 0.3) },
  };

  const imageSection = (
    <div className="relative w-full bg-neutral-800 overflow-hidden">
      {youtubeId ? (
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
          aspectRatio={
            primaryVideo.width && primaryVideo.height
              ? `${primaryVideo.width} / ${primaryVideo.height}`
              : '16 / 9'
          }
        />
      ) : hasImage ? (
        <>
          {!imageLoaded && (
            <div className="w-full aspect-video animate-pulse bg-neutral-700" />
          )}
          <img
            src={thumbnailUrl}
            alt={title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
            style={{
              aspectRatio:
                primaryMedia?.width && primaryMedia?.height
                  ? `${primaryMedia.width} / ${primaryMedia.height}`
                  : '16 / 9',
              maxHeight: '400px',
            }}
          />
        </>
      ) : (
        <div className="w-full aspect-video">
          <ImagePlaceholder size="full" />
        </div>
      )}
    </div>
  );

  const contentSection = (
    <div className="p-4">
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
        <Favicon src={favicon?.url} domain={link.domain} alt={link.domain} size={14} />
        <span className="text-neutral-500 text-xs truncate">{sourceText}</span>
        {youtubeId && (
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-500 hover:text-primary transition-colors ml-auto inline-flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {t('linkCard.watchOnYouTube')}
          </a>
        )}
      </div>
    </div>
  );

  // YouTube cards: div wrapper (iframe captures clicks)
  if (youtubeId) {
    return (
      <motion.div
        ref={cardRef}
        data-item-id={itemId}
        {...motionProps}
        className="block bg-surface rounded-xl overflow-hidden hover:scale-[1.01] hover:brightness-110 transition-all duration-200 no-underline group"
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
      className="block bg-surface rounded-xl overflow-hidden hover:scale-[1.01] hover:brightness-110 transition-all duration-200 no-underline group"
    >
      {imageSection}
      {contentSection}
    </motion.a>
  );
}
