import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "seekitup-video-muted";

interface VideoAudioContextValue {
  isMuted: boolean;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
}

const VideoAudioContext = createContext<VideoAudioContextValue | undefined>(
  undefined,
);

function loadMutePreference(): boolean {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) return true;
  return raw === "true";
}

export function VideoAudioProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState<boolean>(loadMutePreference);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(isMuted));
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setIsMuted(muted);
  }, []);

  return (
    <VideoAudioContext.Provider value={{ isMuted, toggleMute, setMuted }}>
      {children}
    </VideoAudioContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useVideoAudio(): VideoAudioContextValue {
  const ctx = useContext(VideoAudioContext);
  if (!ctx)
    throw new Error("useVideoAudio must be used within a VideoAudioProvider");
  return ctx;
}
