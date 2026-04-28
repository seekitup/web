import { useCallback, useState } from "react";

export interface UseProgressiveImageResult {
  thumbnailReady: boolean;
  fullReady: boolean;
  onThumbnailRendered: () => void;
  onFullRendered: () => void;
}

/**
 * Tracks the render states of a progressive image (thumbnail layer, then
 * full-resolution layer on top). Mirrors the mobile hook so the layered
 * crossfade behaves identically across platforms.
 */
export const useProgressiveImage = (): UseProgressiveImageResult => {
  const [thumbnailReady, setThumbnailReady] = useState(false);
  const [fullReady, setFullReady] = useState(false);

  const onThumbnailRendered = useCallback(() => {
    setThumbnailReady(true);
  }, []);

  const onFullRendered = useCallback(() => {
    setFullReady(true);
  }, []);

  return { thumbnailReady, fullReady, onThumbnailRendered, onFullRendered };
};
