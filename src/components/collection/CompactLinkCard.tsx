import { useState } from 'react';
import { motion } from 'framer-motion';
import type { LinkResponseDto } from '@/types/api';
import { Favicon } from '@/components/ui/Favicon';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import {
  getLinkDisplayTitle,
  getLinkPrimaryMedia,
  getLinkFavicon,
  getLinkSourceText,
  formatLinkPrice,
  isYouTubeLink,
  extractYouTubeVideoId,
  getYouTubeThumbnailUrl,
} from '@/lib/linkUtils';

interface CompactLinkCardProps {
  link: LinkResponseDto;
  index: number;
  itemId?: string;
}

export function CompactLinkCard({ link, index, itemId }: CompactLinkCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const title = getLinkDisplayTitle(link);
  const primaryMedia = getLinkPrimaryMedia(link);
  const favicon = getLinkFavicon(link);
  const sourceText = getLinkSourceText(link);
  const price = formatLinkPrice(link.productPrice, link.productPriceCurrency);

  const youtubeId = isYouTubeLink(link.url) ? extractYouTubeVideoId(link.url) : null;
  const thumbnailUrl = youtubeId
    ? getYouTubeThumbnailUrl(youtubeId)
    : primaryMedia?.url;

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      data-item-id={itemId}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.25) }}
      className="flex bg-surface rounded-xl overflow-hidden hover:scale-[1.01] hover:brightness-110 transition-all duration-200 no-underline group h-[90px]"
    >
      {/* Thumbnail */}
      <div className="w-[90px] h-[90px] shrink-0 bg-neutral-800 relative overflow-hidden">
        {thumbnailUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-neutral-700" />
            )}
            <img
              src={thumbnailUrl}
              alt={title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {youtubeId && imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 bg-black/70 rounded-full flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <polygon points="8,5 20,12 8,19" />
                  </svg>
                </div>
              </div>
            )}
          </>
        ) : (
          <ImagePlaceholder size="compact" />
        )}
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
          <Favicon src={favicon?.url} domain={link.domain} alt={link.domain} size={12} />
          <span className="text-neutral-500 text-xs truncate">{sourceText}</span>
        </div>
      </div>
    </motion.a>
  );
}
