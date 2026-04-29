import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Favicon } from "@/components/ui/Favicon";
import {
  isYouTubeLink,
  extractYouTubeVideoId,
  getPreviewImageUrl,
  formatLinkPrice,
} from "@/lib/linkUtils";
import type {
  CollectionDisplayData,
  CollectionDisplayPreviewLink,
} from "@/lib/collectionDisplay";

interface ExpandedSubcollectionProps {
  collection: CollectionDisplayData;
  index: number;
  itemId?: string;
  /** Optional kebab/icon affordance rendered absolutely in the header. */
  actionSlot?: ReactNode;
}

function getPreviewTitle(link: CollectionDisplayPreviewLink): string {
  const titlesMatch = link.title?.trim() === link.ogTitle?.trim();
  if (titlesMatch) {
    if (link.platformPostTitle?.trim()) return link.platformPostTitle.trim();
    if (link.productName?.trim()) return link.productName.trim();
  }
  return link.title || link.ogTitle || link.url;
}

function getPreviewFavicon(
  link: CollectionDisplayPreviewLink,
): string | undefined {
  const faviconFile = link.files.find((f) => f.purpose === "favicon");
  return faviconFile?.url;
}

function getPreviewSource(link: CollectionDisplayPreviewLink): string {
  return link.platformUserName ? `@${link.platformUserName}` : link.domain;
}

function PreviewCard({ link }: { link: CollectionDisplayPreviewLink }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrl = getPreviewImageUrl(link);
  const title = getPreviewTitle(link);
  const faviconUrl = getPreviewFavicon(link);
  const source = getPreviewSource(link);
  const price = formatLinkPrice(link.productPrice, link.productPriceCurrency);
  const youtubeId = isYouTubeLink(link.url)
    ? extractYouTubeVideoId(link.url)
    : null;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0 w-[200px] bg-surface-light rounded-xl overflow-hidden hover:scale-[1.02] hover:brightness-110 transition-all duration-200 no-underline group"
    >
      <div className="relative w-full aspect-[4/3] bg-background overflow-hidden">
        {imageUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-neutral-700" />
            )}
            <img
              src={imageUrl}
              alt={title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
            {youtubeId && imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 bg-black/70 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <polygon points="8,5 20,12 8,19" />
                  </svg>
                </div>
              </div>
            )}
          </>
        ) : (
          <ImagePlaceholder size="compact" />
        )}
        {price && (
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-bold text-primary bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
              {price}
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <h4 className="text-white text-xs font-semibold leading-snug line-clamp-2 mb-1.5 group-hover:text-primary-light transition-colors">
          {title}
        </h4>
        <div className="flex items-center gap-1.5">
          <Favicon
            src={faviconUrl}
            domain={link.domain}
            alt={link.domain}
            size={12}
          />
          <span className="text-neutral-500 text-[11px] truncate">
            {source}
          </span>
        </div>
      </div>
    </a>
  );
}

export function ExpandedSubcollection({
  collection,
  index,
  itemId,
  actionSlot,
}: ExpandedSubcollectionProps) {
  const { t } = useTranslation();
  const { previewLinks, totalLinks, ownerUsername, slug, name } = collection;
  const remaining = totalLinks - previewLinks.length;
  const collectionPath = `/${ownerUsername}/${slug}`;

  return (
    <motion.div
      data-item-id={itemId}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.08, 0.3) }}
      className="mb-4 bg-surface rounded-2xl border border-neutral-700/40 overflow-hidden relative"
    >
      <Link
        to={collectionPath}
        className="flex items-center gap-2 px-4 pt-3.5 pb-3 group no-underline"
      >
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h3 className="text-white text-sm font-semibold truncate group-hover:text-primary-light transition-colors">
          {name}
        </h3>
        <span className="text-neutral-600 text-xs shrink-0">
          {t("common.link", { count: totalLinks })}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-neutral-600 shrink-0 group-hover:text-primary-light transition-colors ml-auto ${
            actionSlot ? "mr-10" : ""
          }`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>

      {actionSlot ? (
        <span
          className="absolute top-2.5 right-3 z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {actionSlot}
        </span>
      ) : null}

      {previewLinks.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide">
          {previewLinks.map((link) => (
            <PreviewCard key={link.id} link={link} />
          ))}

          {remaining > 0 && (
            <Link
              to={collectionPath}
              className="shrink-0 w-[200px] bg-surface-light rounded-xl overflow-hidden flex flex-col items-center justify-center no-underline hover:brightness-125 transition-all group"
            >
              <div className="text-2xl font-bold text-primary mb-1">
                +{remaining}
              </div>
              <span className="text-neutral-500 text-xs group-hover:text-neutral-400 transition-colors">
                {t("childCollections.seeAll")}
              </span>
            </Link>
          )}
        </div>
      ) : (
        <div className="h-20 mx-4 mb-4 bg-surface-light rounded-xl flex items-center justify-center">
          <p className="text-neutral-600 text-xs">
            {t("collectionPage.emptyLinks")}
          </p>
        </div>
      )}
    </motion.div>
  );
}
