import { useState } from "react";
import type { LinkResponseDto } from "@/types/api";
import { Favicon } from "@/components/ui/Favicon";
import {
  getLinkFavicon,
  getLinkedInProfilePicture,
  getLinkedInCoverImage,
} from "@/lib/linkUtils";

interface LinkedInHeroCardProps {
  link: LinkResponseDto;
}

export function LinkedInHeroCard({ link }: LinkedInHeroCardProps) {
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  const profilePic = getLinkedInProfilePicture(link);
  const coverImage = getLinkedInCoverImage(link);
  const favicon = getLinkFavicon(link);

  const name = link.platformUserName || link.title || link.ogTitle || "";
  const headline = link.platformPostTitle || "";

  // Show clean URL like "linkedin.com/in/username"
  const displayUrl = link.url
    ? link.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "")
    : link.domain || "";

  return (
    <div className="bg-white overflow-hidden rounded-xl flex flex-col">
      {/* Banner */}
      <div className="h-20 relative overflow-hidden">
        {coverImage?.url ? (
          <>
            {!coverLoaded && (
              <div className="absolute inset-0 animate-pulse bg-neutral-200" />
            )}
            <img
              src={coverImage.url}
              alt=""
              loading="lazy"
              onLoad={() => setCoverLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                coverLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          <div
            className="w-full h-full"
            style={{ background: "linear-gradient(135deg, #0077B5, #004182)" }}
          />
        )}
      </div>

      {/* Avatar + Info - left aligned */}
      <div className="px-5 -mt-12">
        {/* Avatar */}
        <div className="w-[86px] h-[86px] rounded-full border-[3px] border-neutral-200 overflow-hidden bg-[#E7E2DC] shrink-0 relative z-10">
          {profilePic?.url ? (
            <>
              {!avatarLoaded && (
                <div className="absolute inset-0 animate-pulse bg-neutral-200 rounded-full" />
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

        {/* Name & Headline - left aligned */}
        <div className="pt-2 px-1">
          {name && (
            <h3 className="text-neutral-900 font-bold text-base leading-snug truncate">
              {name}
            </h3>
          )}
          {headline && (
            <p className="text-neutral-500 text-sm line-clamp-2 mt-0.5 leading-snug">
              {headline}
            </p>
          )}
        </div>
      </div>

      {/* Bottom row: favicon + url | LinkedIn logo */}
      <div className="flex items-center justify-between px-4 pb-3 pt-2.5 mt-4">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Favicon
            src={favicon?.url}
            domain={link.domain}
            alt={link.domain}
            size={14}
          />
          <span className="text-neutral-400 text-xs truncate">
            {displayUrl}
          </span>
        </div>
        <img
          src="/linkedin-logo.png"
          alt="LinkedIn"
          className="h-5 w-auto shrink-0 ml-3"
        />
      </div>
    </div>
  );
}
