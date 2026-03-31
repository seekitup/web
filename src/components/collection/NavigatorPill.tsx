import { memo, useState } from 'react';
import { motion } from 'framer-motion';

export type NavigatorItem =
  | {
      kind: 'collection';
      id: string;
      name: string;
      previewImages: (string | undefined)[];
    }
  | {
      kind: 'link';
      id: string;
      title: string;
      thumbnailUrl: string | undefined;
      faviconUrl: string | undefined;
      domain: string;
    };

interface NavigatorPillProps {
  item: NavigatorItem;
  isActive: boolean;
  onClick: () => void;
}

function MiniImage({ src, alt }: { src: string | undefined; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-full h-full bg-surface-light flex items-center justify-center">
        <img
          src="/logo-square.png"
          alt=""
          className="w-2.5 h-2.5 object-contain grayscale opacity-30"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-surface-light overflow-hidden">
      {!loaded && <div className="absolute inset-0 animate-pulse bg-neutral-700" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}

function CollectionPill({ item, isActive }: { item: Extract<NavigatorItem, { kind: 'collection' }>; isActive: boolean }) {
  const images = item.previewImages.slice(0, 4);
  // Pad to 4 slots
  while (images.length < 4) images.push(undefined);

  return (
    <div className="relative w-full h-full">
      {/* 2x2 grid */}
      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-[0.5px] bg-neutral-700/40 overflow-hidden rounded-xl">
        {images.map((src, i) => (
          <MiniImage key={i} src={src} alt={`${item.name} preview ${i + 1}`} />
        ))}
      </div>
      {/* Folder icon overlay */}
      <div
        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors duration-200 ${
          isActive ? 'bg-primary' : 'bg-neutral-600'
        }`}
      >
        <svg
          width="7"
          height="7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isActive ? 'text-background' : 'text-neutral-300'}
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </div>
    </div>
  );
}

function FaviconBadge({ src, domain }: { src: string | undefined; domain: string }) {
  const [error, setError] = useState(false);
  const fallbackSrc = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
  const imgSrc = error || !src ? fallbackSrc : src;

  return (
    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-background ring-1 ring-neutral-700/60 overflow-hidden flex items-center justify-center">
      <img
        src={imgSrc}
        alt=""
        className="w-3 h-3 object-contain rounded-sm"
        onError={() => setError(true)}
        aria-hidden="true"
      />
    </div>
  );
}

function LinkPill({ item }: { item: Extract<NavigatorItem, { kind: 'link' }> }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!item.thumbnailUrl || error) {
    return (
      <div className="relative w-full h-full">
        <div className="w-full h-full bg-surface-light rounded-xl flex items-center justify-center">
          <img
            src="/logo-square.png"
            alt=""
            className="w-4 h-4 object-contain grayscale opacity-30"
            aria-hidden="true"
          />
        </div>
        <FaviconBadge src={item.faviconUrl} domain={item.domain} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full bg-surface-light rounded-xl overflow-hidden">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-neutral-700 rounded-xl" />}
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
      <FaviconBadge src={item.faviconUrl} domain={item.domain} />
    </div>
  );
}

export const NavigatorPill = memo(function NavigatorPill({
  item,
  isActive,
  onClick,
}: NavigatorPillProps) {
  return (
    <motion.button
      data-nav-id={item.id}
      onClick={onClick}
      animate={{
        scale: isActive ? 1.18 : 1,
        opacity: isActive ? 1 : 0.45,
      }}
      transition={{
        scale: { type: 'spring', stiffness: 400, damping: 25 },
        opacity: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative shrink-0 w-11 h-11 rounded-xl overflow-visible cursor-pointer
        transition-shadow duration-300 focus:outline-none
        ${isActive
          ? 'ring-[2px] ring-primary'
          : 'ring-0 shadow-none hover:opacity-70'
        }
      `}
      aria-label={item.kind === 'collection' ? item.name : item.title}
    >
      {item.kind === 'collection' ? (
        <CollectionPill item={item} isActive={isActive} />
      ) : (
        <LinkPill item={item} />
      )}
    </motion.button>
  );
});
