import { useRef, useEffect, type MouseEvent } from 'react';
import { useVideoAudio } from '@/hooks/useVideoAudio';

interface VideoPlayerProps {
  src: string;
  poster?: string | undefined;
  isVisible: boolean;
  aspectRatio?: string | undefined;
  maxHeight?: string | undefined;
}

export function VideoPlayer({ src, poster, isVisible, aspectRatio = '16 / 9', maxHeight = '400px' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isMuted, toggleMute, setMuted } = useVideoAudio();

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
        video.muted = true;
        setMuted(true);
        video.play().catch(() => {});
      });
    } else {
      video.pause();
    }
  }, [isVisible, setMuted]);

  const handleMuteClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMute();
  };

  return (
    <div className="relative w-full bg-neutral-800 overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop
        playsInline
        preload="metadata"
        className="w-full object-cover pointer-events-none"
        style={{ aspectRatio, maxHeight }}
      />
      <button
        type="button"
        onClick={handleMuteClick}
        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        aria-pressed={!isMuted}
        className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/75 flex items-center justify-center transition-colors"
      >
        {isMuted ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>
    </div>
  );
}
