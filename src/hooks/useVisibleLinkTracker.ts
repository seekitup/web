import { useState, useCallback } from 'react';

export function useVisibleLinkTracker() {
  const [visibleLinkId, setVisibleLinkId] = useState<number | null>(null);

  const handleVisibilityChange = useCallback((linkId: number, inView: boolean) => {
    if (inView) {
      setVisibleLinkId(linkId);
    } else {
      setVisibleLinkId((prev) => (prev === linkId ? null : prev));
    }
  }, []);

  return { visibleLinkId, handleVisibilityChange };
}
