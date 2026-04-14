import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { LookupChildCollectionDto, LookupPreviewLinkDto } from '@/types/api';
import { getPreviewImageUrl } from '@/lib/linkUtils';

interface CompactSubcollectionProps {
  collection: LookupChildCollectionDto;
  parentUsername: string;
  index: number;
  itemId?: string;
}

function ThumbnailCell({
  link,
  remaining,
}: {
  link: LookupPreviewLinkDto;
  remaining?: number | undefined;
}) {
  const [loaded, setLoaded] = useState(false);
  const imageUrl = getPreviewImageUrl(link);

  return (
    <div className="relative w-full h-full bg-surface-light overflow-hidden">
      {imageUrl ? (
        <>
          {!loaded && <div className="absolute inset-0 animate-pulse bg-neutral-700" />}
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-surface-light">
          <img
            src="/logo-square.png"
            alt=""
            className="w-6 h-6 object-contain grayscale opacity-30"
            aria-hidden="true"
          />
        </div>
      )}
      {remaining !== undefined && remaining > 0 && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
          <span className="text-white text-sm font-bold">+{remaining}</span>
        </div>
      )}
    </div>
  );
}

function EmptyCell() {
  return (
    <div className="w-full h-full bg-surface-light flex items-center justify-center">
      <img
        src="/logo-square.png"
        alt=""
        className="w-6 h-6 object-contain grayscale opacity-20"
        aria-hidden="true"
      />
    </div>
  );
}

export function CompactSubcollection({
  collection,
  parentUsername,
  index,
  itemId,
}: CompactSubcollectionProps) {
  const { t } = useTranslation();
  const { previewLinks, totalLinks } = collection;
  const gridLinks = previewLinks.slice(0, 4);
  const remaining = totalLinks - gridLinks.length;

  return (
    <motion.div
      data-item-id={itemId}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.06, 0.25) }}
    >
      <Link
        to={`/${parentUsername}/${collection.slug}`}
        className="block no-underline group bg-surface rounded-2xl border border-neutral-700/40 overflow-hidden hover:border-neutral-600/60 transition-colors"
      >
        {/* 2x2 Thumbnail Grid */}
        <div className="aspect-[4/3] grid grid-cols-2 grid-rows-2 gap-[1px] bg-neutral-700/30">
          {gridLinks.length === 0 ? (
            <>
              <EmptyCell />
              <EmptyCell />
              <EmptyCell />
              <EmptyCell />
            </>
          ) : gridLinks.length === 1 ? (
            <div className="col-span-2 row-span-2">
              <ThumbnailCell
                link={gridLinks[0]!}
                remaining={remaining > 0 ? remaining : undefined}
              />
            </div>
          ) : gridLinks.length === 2 ? (
            <>
              <ThumbnailCell link={gridLinks[0]!} />
              <ThumbnailCell link={gridLinks[1]!} />
              <EmptyCell />
              <EmptyCell />
            </>
          ) : gridLinks.length === 3 ? (
            <>
              <ThumbnailCell link={gridLinks[0]!} />
              <ThumbnailCell link={gridLinks[1]!} />
              <ThumbnailCell link={gridLinks[2]!} />
              <EmptyCell />
            </>
          ) : (
            <>
              <ThumbnailCell link={gridLinks[0]!} />
              <ThumbnailCell link={gridLinks[1]!} />
              <ThumbnailCell link={gridLinks[2]!} />
              <ThumbnailCell
                link={gridLinks[3]!}
                remaining={remaining > 0 ? remaining : undefined}
              />
            </>
          )}
        </div>

        {/* Label inside card */}
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <svg
                width="12"
                height="12"
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
            <div className="min-w-0 flex-1">
              <h4 className="text-white text-sm font-semibold truncate group-hover:text-primary-light transition-colors">
                {collection.name}
              </h4>
            </div>
          </div>
          <p className="text-neutral-500 text-xs mt-1 pl-8">
            {t('common.link', { count: totalLinks })}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
