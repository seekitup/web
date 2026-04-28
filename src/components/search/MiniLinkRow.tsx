import { memo } from "react";
import clsx from "clsx";
import type { LinkResponseDto } from "@/types/api";
import { useAuth } from "@/hooks/useAuth";
import { Favicon } from "@/components/ui/Favicon";
import { HighlightedText } from "@/components/ui/HighlightedText";
import { OwnershipChip } from "@/components/create/OwnershipChip";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ProgressiveMedia } from "@/components/ui/ProgressiveMedia";
import {
  getLinkDisplayTitle,
  getLinkFavicon,
  getLinkPrimaryMedia,
  isYouTubeLink,
  extractYouTubeVideoId,
  getYouTubeThumbnailUrl,
} from "@/lib/linkUtils";
import { getLinkOwnership } from "@/lib/ownership";

const MAX_COLLECTIONS_SHOWN = 3;

interface MiniLinkRowProps {
  link: LinkResponseDto;
  onClick: (link: LinkResponseDto) => void;
  highlightQuery?: string | undefined;
  className?: string | undefined;
}

/**
 * Compact list row for a link result. Visual port of the mobile MiniLink
 * `showDetail` mode: 44px square thumbnail + title + ownership chip + a wrap
 * row of "where this lives" pills (collection names, max 3 + overflow).
 */
export const MiniLinkRow = memo<MiniLinkRowProps>(function MiniLinkRow({
  link,
  onClick,
  highlightQuery,
  className,
}) {
  const { user } = useAuth();
  const title = getLinkDisplayTitle(link);
  const primaryMedia = getLinkPrimaryMedia(link);
  const favicon = getLinkFavicon(link);
  const ownership = getLinkOwnership(link, user?.id);

  const youtubeId = isYouTubeLink(link.url)
    ? extractYouTubeVideoId(link.url)
    : null;

  const collections = link.collections ?? [];
  const overflow = collections.length - MAX_COLLECTIONS_SHOWN;

  return (
    <button
      type="button"
      onClick={() => onClick(link)}
      className={clsx(
        "group flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-white/[0.04] focus-visible:bg-white/[0.04] focus-visible:outline-none rounded-lg cursor-pointer",
        className,
      )}
    >
      {/* Thumbnail with favicon overlay */}
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg">
        {youtubeId ? (
          <img
            src={getYouTubeThumbnailUrl(youtubeId)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : primaryMedia ? (
          <ProgressiveMedia
            file={primaryMedia}
            width={44}
            height={44}
            borderRadius={8}
            thumbnailOnly
          />
        ) : (
          <ImagePlaceholder size="compact" />
        )}
        {favicon?.url ? (
          <span className="absolute bottom-0.5 right-0.5">
            <Favicon
              src={favicon.url}
              domain={link.domain}
              alt={link.domain}
              size={14}
            />
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <HighlightedText
            text={title}
            highlight={highlightQuery}
            className="text-[15px] font-semibold leading-snug text-text group-hover:text-primary-light transition-colors"
            clamp="line-clamp-1"
          />
          {ownership !== "own" ? (
            <OwnershipChip ownership={ownership} className="shrink-0" />
          ) : null}
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {collections.length === 0 ? (
            <CollectionPill label={link.domain} faded />
          ) : (
            collections
              .slice(0, MAX_COLLECTIONS_SHOWN)
              .map((c) => <CollectionPill key={c.id} label={c.name} />)
          )}
          {overflow > 0 ? <CollectionPill label={`+${overflow}`} /> : null}
        </div>
      </div>
    </button>
  );
});

function CollectionPill({
  label,
  faded = false,
}: {
  label: string;
  faded?: boolean;
}) {
  return (
    <span
      className={clsx(
        "inline-flex max-w-[160px] items-center truncate rounded-full bg-neutral-800/80 px-2 py-px text-[11px] font-medium leading-4",
        faded ? "text-text-dim/70" : "text-text-dim",
      )}
      title={label}
    >
      {label}
    </span>
  );
}
