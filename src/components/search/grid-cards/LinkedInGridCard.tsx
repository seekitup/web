import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { LinkResponseDto } from "@/types/api";
import { PendingMediaSkeleton } from "@/components/ui/PendingMediaSkeleton";
import { ProgressiveMedia } from "@/components/ui/ProgressiveMedia";
import {
  isLinkPendingMedia,
  usePendingLinkPolling,
} from "@/hooks/usePendingLinkPolling";
import {
  getLinkDisplayTitle,
  getLinkedInCoverImage,
  getLinkedInProfilePicture,
} from "@/lib/linkUtils";

interface LinkedInGridCardProps {
  link: LinkResponseDto;
  index: number;
  itemId?: string;
  actionSlot?: ReactNode;
}

/**
 * Portrait grid card for LinkedIn profiles. Uses LinkedIn's familiar visual
 * language: a cover banner (real cover image when available, branded blue
 * gradient otherwise), a circular avatar overlapping the banner, then name +
 * headline + clean URL. Shares the aspect-[3/4] / flex-[3]+flex-[2] geometry
 * of the other grid cards so heights stay aligned.
 */
export function LinkedInGridCard({
  link: linkProp,
  index,
  itemId,
  actionSlot,
}: LinkedInGridCardProps) {
  const link = usePendingLinkPolling(linkProp);
  const isPending = isLinkPendingMedia(link);

  const [avatarLoaded, setAvatarLoaded] = useState(false);

  const profilePic = getLinkedInProfilePicture(link);
  const coverImage = getLinkedInCoverImage(link);

  const name =
    link.platformUserName?.trim() ||
    link.title?.trim() ||
    link.ogTitle?.trim() ||
    getLinkDisplayTitle(link);
  const headline = link.platformPostTitle?.trim() || "";
  const displayUrl = link.url
    ? link.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "")
    : link.domain || "";

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} on LinkedIn`}
      data-item-id={itemId}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.25) }}
      className="group relative aspect-square flex flex-col overflow-hidden rounded-2xl bg-surface border border-white/5 no-underline transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0077B5]/40 hover:shadow-[0_8px_24px_-8px_rgba(0,119,181,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {/* Cover banner — real cover image when available, branded blue gradient
          with a soft radial highlight as the fallback. While pending, the
          banner is the skeleton (logo badge stays — domain is known immediately). */}
      <div className="relative h-32 shrink-0 overflow-hidden bg-gradient-to-br from-[#0077B5] to-[#004182]">
        {isPending ? (
          <PendingMediaSkeleton className="absolute inset-0" />
        ) : coverImage ? (
          <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
            <ProgressiveMedia
              file={coverImage}
              width="100%"
              height="100%"
              thumbnailOnly
              alt=""
            />
          </div>
        ) : (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.18), transparent 55%)",
            }}
          />
        )}

        {/* LinkedIn logo badge — top-left so it never collides with actionSlot top-right */}
        <span className="absolute top-2 left-2 flex items-center rounded-md bg-white/95 px-1.5 py-1 shadow-sm">
          <img
            src="/linkedin-logo.png"
            alt="LinkedIn"
            className="block h-3 w-auto"
          />
        </span>
      </div>

      {/* Avatar — centered, large, overlapping the banner */}
      <div className="relative z-10 mx-auto -mt-12 size-24 shrink-0 overflow-hidden rounded-full bg-[#E7E2DC] ring-4 ring-surface">
        {isPending ? (
          <PendingMediaSkeleton
            className="absolute inset-0 rounded-full"
            size="small"
          />
        ) : profilePic?.url ? (
          <>
            {!avatarLoaded ? (
              <div className="absolute inset-0 animate-pulse bg-neutral-300" />
            ) : null}
            <img
              src={profilePic.url}
              alt={name}
              loading="lazy"
              onLoad={() => setAvatarLoaded(true)}
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                avatarLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          <svg viewBox="0 0 128 128" className="h-full w-full">
            <path fill="#e7e2dc" d="M0 0h128v128H0z" />
            <path
              d="M88.41 84.67a32 32 0 10-48.82 0 66.13 66.13 0 0148.82 0z"
              fill="#788fa5"
            />
            <path
              d="M88.41 84.67a32 32 0 01-48.82 0A66.79 66.79 0 000 128h128a66.79 66.79 0 00-39.59-43.33z"
              fill="#9db3c8"
            />
            <path
              d="M64 96a31.93 31.93 0 0024.41-11.33 66.13 66.13 0 00-48.82 0A31.93 31.93 0 0064 96z"
              fill="#56687a"
            />
          </svg>
        )}
      </div>

      {/* Body — centered name + headline */}
      <div className="flex flex-1 flex-col items-center px-4 pt-2 pb-2 text-center">
        <h3 className="truncate w-full text-base font-bold leading-tight text-white transition-colors group-hover:text-primary-light">
          {name}
        </h3>
        {headline ? (
          <p className="line-clamp-2 mt-1 text-xs leading-snug text-white/70">
            {headline}
          </p>
        ) : null}
      </div>

      {/* Footer — centered URL with same border + spacing as other variants */}
      <div className="flex shrink-0 items-center justify-center gap-1.5 border-t border-white/5 px-3 py-2">
        <span
          className="flex size-3.5 items-center justify-center rounded-[3px] bg-[#0a66c2]"
          aria-hidden="true"
        >
          <span className="text-[8px] font-bold leading-none text-white">
            in
          </span>
        </span>
        <span className="truncate text-[11px] font-medium text-[#0a66c2]">
          {displayUrl}
        </span>
      </div>

      {actionSlot ? (
        <span
          className="absolute top-2 right-2 z-20"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {actionSlot}
        </span>
      ) : null}
    </motion.a>
  );
}
