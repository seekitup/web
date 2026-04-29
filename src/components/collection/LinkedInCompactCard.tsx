import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { LinkResponseDto } from "@/types/api";
import { Favicon } from "@/components/ui/Favicon";
import {
  getLinkFavicon,
  getLinkedInProfilePicture,
} from "@/lib/linkUtils";

interface LinkedInCompactCardProps {
  link: LinkResponseDto;
  index: number;
  itemId?: string;
  actionSlot?: ReactNode;
}

/**
 * Compact (Grid-mode) variant of the LinkedIn link card. Shares the 90px
 * horizontal geometry of `CompactLinkCard` but swaps the thumbnail cell for
 * a circular profile avatar over the LinkedIn-blue gradient and the meta row
 * for `platformPostTitle` (headline) / clean `linkedin.com/...` URL.
 */
export function LinkedInCompactCard({
  link,
  index,
  itemId,
  actionSlot,
}: LinkedInCompactCardProps) {
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  const profilePic = getLinkedInProfilePicture(link);
  const favicon = getLinkFavicon(link);

  const name =
    link.platformUserName?.trim() ||
    link.title?.trim() ||
    link.ogTitle?.trim() ||
    link.url;
  const headline = link.platformPostTitle?.trim() || "";
  const displayUrl = link.url
    ? link.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "")
    : link.domain || "";

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      data-item-id={itemId}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.25) }}
      className="flex bg-surface rounded-xl overflow-hidden hover:scale-[1.01] hover:brightness-110 transition-all duration-200 no-underline group h-[90px] relative"
    >
      {/* Avatar cell — LinkedIn-blue gradient backdrop with circular profile pic */}
      <div
        className="w-[90px] h-[90px] shrink-0 relative overflow-hidden flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0077B5, #004182)" }}
      >
        <div className="w-[58px] h-[58px] rounded-full overflow-hidden bg-[#E7E2DC] border-2 border-white/90 relative">
          {profilePic?.url ? (
            <>
              {!avatarLoaded && (
                <div className="absolute inset-0 animate-pulse bg-neutral-300" />
              )}
              <img
                src={profilePic.url}
                alt={name}
                loading="lazy"
                onLoad={() => setAvatarLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  avatarLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </>
          ) : (
            <svg viewBox="0 0 128 128" className="w-full h-full">
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
        {/* LinkedIn logo badge */}
        <span className="absolute bottom-1 right-1 bg-white rounded-md px-1 py-0.5 shadow-sm">
          <img
            src="/linkedin-logo.png"
            alt="LinkedIn"
            className="h-2.5 w-auto block"
          />
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
        <h3 className="text-white text-sm font-semibold leading-snug line-clamp-1 mb-0.5 group-hover:text-primary-light transition-colors">
          {name}
        </h3>
        {headline ? (
          <p className="text-neutral-400 text-xs leading-snug line-clamp-2 mb-1">
            {headline}
          </p>
        ) : null}
        <div className="flex items-center gap-1.5 mt-auto">
          <Favicon
            src={favicon?.url}
            domain={link.domain}
            alt={link.domain}
            size={12}
          />
          <span className="text-neutral-500 text-xs truncate">
            {displayUrl}
          </span>
        </div>
      </div>

      {actionSlot ? (
        <span
          className="absolute top-1.5 right-1.5 z-10"
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
