import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import clsx from "clsx";
import type { FileResponseDto } from "@/types/api";
import {
  getFileThumbnailUrl,
  getVideoThumbnailUrl,
  isVideoFile,
} from "@/lib/linkUtils";
import { useProgressiveImage } from "@/hooks/useProgressiveImage";
import { useVideoAudio } from "@/hooks/useVideoAudio";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

export interface ProgressiveMediaProps {
  file: FileResponseDto;
  /** Numeric values become px; strings (e.g. "100%") are forwarded as-is. */
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  /** Drives video play/pause and biases full-res loading. */
  isVisible?: boolean;
  /** Skip full-res loading (images) and avoid mounting a <video> element. */
  thumbnailOnly?: boolean;
  /**
   * CSS aspect-ratio (e.g. "16 / 9"). When provided, the container uses
   * width: 100% and lets aspect-ratio drive the height.
   */
  aspectRatio?: string;
  /** Reports the media's natural pixel dimensions once decoded. */
  onNaturalSize?: (naturalWidth: number, naturalHeight: number) => void;
  className?: string;
  alt?: string;
}

const dimensionToCss = (value: number | string | undefined) =>
  typeof value === "number" ? `${value}px` : value;

/**
 * Media-aware renderer for a FileResponseDto. Mirrors the mobile
 * ProgressiveMedia: thumbnail-first image loading with a full-res crossfade,
 * a posterized <video> when the file is a video (or a static thumbnail when
 * thumbnailOnly is set), and a logo placeholder when no URL is available.
 */
export function ProgressiveMedia({
  file,
  width,
  height,
  borderRadius = 0,
  isVisible = false,
  thumbnailOnly = false,
  aspectRatio,
  onNaturalSize,
  className,
  alt = "",
}: ProgressiveMediaProps) {
  const isVideo = isVideoFile(file);
  const fullUrl = file.url || undefined;
  const thumbnailUrl = isVideo
    ? getVideoThumbnailUrl(file)
    : (getFileThumbnailUrl(file) ?? undefined);

  const { fullReady, onFullRendered } = useProgressiveImage();

  // Reset thumbnail-failure state whenever the underlying URL changes —
  // tracked via the prior-value pattern so React doesn't flag a cascading
  // render from a setState inside an effect.
  const [trackedUrl, setTrackedUrl] = useState<string | undefined>(
    thumbnailUrl,
  );
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  if (trackedUrl !== thumbnailUrl) {
    setTrackedUrl(thumbnailUrl);
    setThumbnailFailed(false);
  }

  const handleThumbnailError = useCallback(
    () => setThumbnailFailed(true),
    [],
  );

  const handleNaturalSize = useCallback(
    (w: number, h: number) => {
      if (w && h) onNaturalSize?.(w, h);
    },
    [onNaturalSize],
  );

  const containerStyle: CSSProperties = aspectRatio
    ? {
        width: dimensionToCss(width) ?? "100%",
        aspectRatio,
        borderRadius: borderRadius || undefined,
      }
    : {
        width: dimensionToCss(width),
        height: dimensionToCss(height),
        borderRadius: borderRadius || undefined,
      };

  const containerClass = clsx(
    "relative overflow-hidden bg-[#1E1E1E]",
    className,
  );

  // No URL at all → placeholder.
  if (!fullUrl && !thumbnailUrl) {
    const isCompact =
      typeof width === "number" && width <= 64
        ? true
        : typeof height === "number" && height <= 64;
    return (
      <div className={containerClass} style={containerStyle}>
        <ImagePlaceholder size={isCompact ? "compact" : "full"} />
      </div>
    );
  }

  if (isVideo) {
    if (thumbnailOnly || !fullUrl) {
      return (
        <div className={containerClass} style={containerStyle}>
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={alt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
              onLoad={(e) => {
                const img = e.currentTarget;
                handleNaturalSize(img.naturalWidth, img.naturalHeight);
              }}
              onError={handleThumbnailError}
            />
          ) : (
            <ImagePlaceholder size="compact" />
          )}
        </div>
      );
    }
    return (
      <div className={containerClass} style={containerStyle}>
        <ProgressiveVideo
          src={fullUrl}
          poster={thumbnailUrl}
          isVisible={isVisible}
          onNaturalSize={handleNaturalSize}
        />
      </div>
    );
  }

  // Image branch. When thumbnailOnly is set we want the cheapest single
  // image: render the derived /thumbnail/ URL when we have one, otherwise
  // fall back to file.url (file not yet analyzed, or the thumbnail 404s).
  // When thumbnailOnly is not set we layer the full-res on top of the
  // thumbnail with a crossfade.
  const hasThumbnail = !!thumbnailUrl && !thumbnailFailed;
  const showThumbnailLayer = hasThumbnail;
  const showFullLayer = !!fullUrl && (!thumbnailOnly || !hasThumbnail);

  return (
    <div className={containerClass} style={containerStyle}>
      {showThumbnailLayer && thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={clsx(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
            !thumbnailOnly && fullReady ? "opacity-0" : "opacity-100",
          )}
          onLoad={(e) => {
            const img = e.currentTarget;
            handleNaturalSize(img.naturalWidth, img.naturalHeight);
          }}
          onError={handleThumbnailError}
        />
      ) : null}
      {showFullLayer ? (
        <img
          src={fullUrl}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={clsx(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
            fullReady ? "opacity-100" : "opacity-0",
          )}
          onLoad={(e) => {
            const img = e.currentTarget;
            onFullRendered();
            handleNaturalSize(img.naturalWidth, img.naturalHeight);
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * Bare <video> with poster, looping, muted-by-default, that plays/pauses based
 * on isVisible. Audio state is read from VideoAudioContext so the carousel can
 * own a single mute toggle for the whole card.
 */
function ProgressiveVideo({
  src,
  poster,
  isVisible,
  onNaturalSize,
}: {
  src: string;
  poster: string | undefined;
  isVisible: boolean;
  onNaturalSize: (w: number, h: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isMuted, setMuted } = useVideoAudio();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isVisible) {
      video.play().catch(() => {
        // Autoplay was blocked because audio is on — force-mute and retry.
        video.muted = true;
        setMuted(true);
        video.play().catch(() => {});
      });
    } else {
      video.pause();
    }
  }, [isVisible, setMuted]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      loop
      playsInline
      preload="metadata"
      className="absolute inset-0 h-full w-full object-cover pointer-events-none"
      onLoadedMetadata={(e) => {
        const v = e.currentTarget;
        if (v.videoWidth && v.videoHeight) {
          onNaturalSize(v.videoWidth, v.videoHeight);
        }
      }}
    />
  );
}
