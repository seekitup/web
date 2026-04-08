import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useInView } from 'react-intersection-observer';
import { useCollectionLookup } from '@/hooks/useCollectionLookup';
import { usePublicLinks, flattenLinks } from '@/hooks/usePublicLinks';
import { useActiveItemTracker } from '@/hooks/useActiveItemTracker';
import { CollectionHeader } from '@/components/collection/CollectionHeader';
import { CollectionNavigator } from '@/components/collection/CollectionNavigator';
import { ViewToggle } from '@/components/collection/ViewToggle';
import { ChildCollectionSection } from '@/components/collection/ChildCollectionSection';
import { LinkSection } from '@/components/collection/LinkSection';
import { CollectionLoader } from '@/components/collection/CollectionLoader';
import { ErrorState } from '@/components/ui/ErrorState';
import { getLinkPrimaryMedia, getPreviewImageUrl, getLinkThumbnailUrl, getLinkFavicon } from '@/lib/linkUtils';
import type { NavigatorItem } from '@/components/collection/NavigatorPill';

const VIEW_KEY = 'seekitup-view-mode';

export function CollectionPage() {
  const { t } = useTranslation();
  const { username = '', slug = '' } = useParams<{ username: string; slug: string }>();

  const [view, setView] = useState<'list' | 'grid'>(() => {
    return (localStorage.getItem(VIEW_KEY) as 'list' | 'grid') || 'list';
  });

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
  }, [view]);

  // Fetch collection
  const {
    data: collection,
    isLoading: collectionLoading,
    isError,
  } = useCollectionLookup(username, slug);

  // Fetch links (enabled when collection is loaded)
  const {
    data: linksData,
    isLoading: linksLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = usePublicLinks(collection?.id);

  const links = flattenLinks(linksData?.pages);

  // Infinite scroll
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Build navigator items from child collections + loaded links
  const navigatorItems: NavigatorItem[] = useMemo(() => {
    if (!collection) return [];

    const collectionItems: NavigatorItem[] = collection.childCollections.map((child) => ({
      kind: 'collection' as const,
      id: `collection-${child.id}`,
      name: child.name,
      previewImages: child.previewLinks.slice(0, 4).map((pl) => getPreviewImageUrl(pl)),
    }));

    const linkItems: NavigatorItem[] = links.map((link) => ({
      kind: 'link' as const,
      id: `link-${link.id}`,
      title: link.title || link.url,
      thumbnailUrl: getLinkThumbnailUrl(link),
      faviconUrl: getLinkFavicon(link)?.url,
      domain: link.domain,
    }));

    return [...collectionItems, ...linkItems];
  }, [collection, links]);

  // Track active item for navigator highlighting
  const itemIds = useMemo(() => navigatorItems.map((i) => i.id), [navigatorItems]);
  const { activeItemId, visibleLinkId, handleVisibilityChange, forceActive } = useActiveItemTracker(itemIds);

  // Click handler: scroll page to the matching item + force it active
  const handleNavigatorClick = useCallback((itemId: string) => {
    forceActive(itemId);
    const el = document.querySelector<HTMLElement>(`[data-item-id="${itemId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [forceActive]);

  // OG image from first link
  const ogImage = links.length > 0 ? getLinkPrimaryMedia(links[0])?.url : undefined;

  // Error state
  if (isError) {
    return (
      <>
        <Helmet>
          <title>{t('collectionPage.metaTitleNotFound')}</title>
        </Helmet>
        <ErrorState
          icon={
            <div className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
          }
          title={t('collectionPage.errorTitle')}
          description={t('collectionPage.errorDescription')}
          ctaText={t('collectionPage.errorCta')}
          ctaTo="/download"
          ctaDisabled
          ctaLabel={t('common.comingSoon')}
        />
      </>
    );
  }

  // Loading state
  if (collectionLoading) {
    return (
      <div className="mx-auto max-w-xl w-full">
        <CollectionLoader className="min-h-[60vh]" />
      </div>
    );
  }

  if (!collection) return null;

  return (
    <>
      <Helmet>
        <title>{t('collectionPage.metaTitle', { name: collection.name, username })}</title>
        <meta name="description" content={collection.description || t('collectionPage.metaDescriptionFallback', { name: collection.name })} />
        <meta property="og:title" content={collection.name} />
        <meta property="og:description" content={collection.description || t('collectionPage.ogDescriptionFallback', { username })} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:type" content="website" />
        <meta name="apple-itunes-app" content={`app-id=6757165497, app-argument=https://seekitup.com/${username}/${slug}`} />
      </Helmet>

      <div className="mx-auto max-w-xl w-full">
        {/* Header */}
        <CollectionHeader collection={collection} />

        {/* Sticky horizontal navigator */}
        {navigatorItems.length > 0 && (
          <CollectionNavigator
            items={navigatorItems}
            activeItemId={activeItemId}
            onItemClick={handleNavigatorClick}
          />
        )}

        {/* View toggle + controls */}
        <div className="pb-3">
          <ViewToggle view={view} onViewChange={setView} />
        </div>

        {/* Child collections */}
        {collection.childCollections.length > 0 && (
          <ChildCollectionSection
            childCollections={collection.childCollections}
            parentCollection={collection}
            view={view}
          />
        )}

        {/* Links */}
        {linksLoading ? (
          <CollectionLoader className="py-16" />
        ) : links.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-neutral-500 text-sm">{t('collectionPage.emptyLinks')}</p>
          </div>
        ) : (
          <LinkSection
            links={links}
            view={view}
            visibleLinkId={visibleLinkId}
            onVisibilityChange={handleVisibilityChange}
          />
        )}

        {/* Infinite scroll trigger */}
        {hasNextPage && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {isFetchingNextPage && (
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
        )}

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </>
  );
}
