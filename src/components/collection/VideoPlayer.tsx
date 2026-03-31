import { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  isVisible: boolean;
  aspectRatio?: string;
  maxHeight?: string;
}

export function VideoPlayer({ src, poster, isVisible, aspectRatio = '16 / 9', maxHeight = '400px' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isVisible) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isVisible]);

  return (
    <div className="relative w-full bg-neutral-800 overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full object-cover pointer-events-none"
        style={{ aspectRatio, maxHeight }}
      />
    </div>
  );
}
