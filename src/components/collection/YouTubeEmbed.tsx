import { useState } from 'react';
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
} from '@/lib/linkUtils';

interface YouTubeEmbedProps {
  videoId: string;
  isVisible: boolean;
  isShort: boolean;
  title: string;
}

export function YouTubeEmbed({ videoId, isVisible, isShort, title }: YouTubeEmbedProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const thumbnailUrl = getYouTubeThumbnailUrl(videoId);

  const containerClass = isShort
    ? 'aspect-[9/16] max-h-[80vh] max-w-[360px] mx-auto bg-black'
    : 'aspect-video bg-black';

  return (
    <div className={`relative w-full overflow-hidden ${containerClass}`}>
      {/* Thumbnail background — visible while iframe loads or when not visible */}
      <img
        src={thumbnailUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {!isVisible && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <polygon points="8,5 20,12 8,19" />
            </svg>
          </div>
        </div>
      )}

      {/* iframe — only mounted when visible */}
      {isVisible && (
        <iframe
          src={getYouTubeEmbedUrl(videoId)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          onLoad={() => setIframeLoaded(true)}
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
            iframeLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}
