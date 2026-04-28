import { useEffect, useState, useCallback } from "react";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (typeof navigator !== "undefined") {
      const live = navigator.onLine;
      setIsOnline(live);
      return live;
    }
    return true;
  }, []);

  return { isOnline, isConnected: isOnline, checkConnection };
}
