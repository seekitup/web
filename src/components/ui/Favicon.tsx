import { useState, useMemo } from "react";
import { getGoogleFaviconUrl } from "@/lib/linkUtils";

interface FaviconProps {
  src?: string | undefined;
  domain?: string | undefined;
  alt?: string | undefined;
  size?: number | undefined;
}

type FaviconState = "primary" | "google" | "fallback";

export function Favicon({ src, domain, alt = "", size = 16 }: FaviconProps) {
  const [state, setState] = useState<FaviconState>(
    src ? "primary" : domain ? "google" : "fallback",
  );

  const googleUrl = useMemo(
    () => (domain ? getGoogleFaviconUrl(domain, Math.max(size * 2, 32)) : null),
    [domain, size],
  );

  const handleError = () => {
    if (state === "primary" && googleUrl) {
      setState("google");
    } else {
      setState("fallback");
    }
  };

  if (state === "fallback") {
    return (
      <div
        className="bg-neutral-700 rounded flex items-center justify-center"
        style={{ width: size, height: size, borderRadius: size * 0.25 }}
      >
        <svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-500"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </div>
    );
  }

  const currentSrc = state === "primary" ? src : googleUrl;

  return (
    <img
      src={currentSrc!}
      alt={alt}
      width={size}
      height={size}
      className="object-contain"
      style={{ borderRadius: size * 0.25 }}
      onError={handleError}
      loading="lazy"
    />
  );
}
