import clsx from "clsx";
import type { LinkResponseDto } from "@/types/api";
import { Favicon } from "@/components/ui/Favicon";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ProgressiveMedia } from "@/components/ui/ProgressiveMedia";
import { getLinkFavicon, getLinkPrimaryMedia } from "@/lib/linkUtils";

interface MiniLinkProps {
  link: LinkResponseDto;
  isSelected: boolean;
  onPress: () => void;
}

export function MiniLink({ link, isSelected, onPress }: MiniLinkProps) {
  const display = link.title || link.ogTitle || link.url;
  const primaryMedia = getLinkPrimaryMedia(link);
  const favicon = getLinkFavicon(link);

  return (
    <button
      type="button"
      onClick={onPress}
      className={clsx(
        "flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
        isSelected
          ? "border-primary/60 bg-primary/[0.07]"
          : "border-neutral-800 bg-surface-light/30 hover:border-neutral-700",
      )}
    >
      <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md">
        {primaryMedia ? (
          <ProgressiveMedia
            file={primaryMedia}
            width={28}
            height={28}
            borderRadius={6}
            thumbnailOnly
          />
        ) : (
          <ImagePlaceholder size="compact" />
        )}
        {favicon?.url ? (
          <span className="absolute -bottom-0.5 -right-0.5">
            <Favicon
              src={favicon.url}
              domain={link.domain}
              alt=""
              size={10}
            />
          </span>
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] text-text">{display}</span>
        <span className="block truncate text-[11px] text-text-dim">
          {link.domain}
        </span>
      </span>
      <span
        aria-hidden
        className={clsx(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full transition-colors",
          isSelected ? "bg-primary" : "border-2 border-neutral-600",
        )}
      >
        {isSelected ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-background"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : null}
      </span>
    </button>
  );
}
