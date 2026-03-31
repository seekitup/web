import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import type { LinkResponseDto } from '@/types/api';
import { LinkCard } from '@/components/collection/LinkCard';
import { CompactLinkCard } from '@/components/collection/CompactLinkCard';

interface LinkSectionProps {
  links: LinkResponseDto[];
  view: 'list' | 'grid';
  visibleLinkId: number | null;
  onVisibilityChange: (id: number, isVisible: boolean) => void;
}

export function LinkSection({
  links,
  view,
  visibleLinkId,
  onVisibilityChange,
}: LinkSectionProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  if (links.length === 0) return null;

  return (
    <div className="px-4">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left py-2 group cursor-pointer"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-neutral-500 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="text-neutral-400 text-sm font-medium">
          {t('linkSection.title')}
        </span>
        <span className="text-neutral-600 text-xs">
          ({links.length})
        </span>
      </button>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-1 gap-3' : 'space-y-4'}>
              {links.map((link, index) =>
                view === 'grid' ? (
                  <CompactLinkCard key={link.id} link={link} index={index} itemId={`link-${link.id}`} />
                ) : (
                  <LinkCard
                    key={link.id}
                    link={link}
                    index={index}
                    isVisible={link.id === visibleLinkId}
                    onVisibilityChange={onVisibilityChange}
                    itemId={`link-${link.id}`}
                  />
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
