import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSearch } from "@/hooks/useSearch";
import { useAuth } from "@/hooks/useAuth";
import { SetOutletWidth } from "@/components/layout/OutletWidth";
import {
  FilterChips,
  type SearchTypeFilter,
  type SearchVisibilityFilter,
} from "@/components/search/FilterChips";
import {
  ResultsView,
  ResultsViewModeToggle,
  type ResultsViewSection,
} from "@/components/search/ResultsView";
import { useResultsViewMode } from "@/hooks/useResultsViewMode";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { SearchSkeleton } from "@/components/search/SearchSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EntityActionKebab } from "@/components/collection/EntityActionKebab";
import { LinkOptionsModal } from "@/components/collection/LinkOptionsModal";
import { CollectionOptionsModal } from "@/components/collection/CollectionOptionsModal";
import type {
  CollectionResponseDto,
  LinkResponseDto,
} from "@/types/api";

export function SearchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlQuery = searchParams.get("q") ?? "";

  const {
    searchText,
    setSearchText,
    debouncedQuery,
    clearSearch,
    links,
    collections,
    isLoading,
    isLocalResults,
    isError,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  } = useSearch({ initialQuery: urlQuery });

  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Mobile-only: focus the on-page input on first mount.
  useEffect(() => {
    mobileInputRef.current?.focus();
  }, []);

  // Sync URL → input as the URL changes (back/forward, deep links).
  useEffect(() => {
    if (urlQuery !== searchText) {
      setSearchText(urlQuery);
    }
    // We only want to react to URL changes; setSearchText is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  // Push input changes back to the URL with replace so we don't pollute history.
  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (current === searchText) return;
    setSearchParams(searchText ? { q: searchText } : {}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const [typeFilter, setTypeFilter] = useState<SearchTypeFilter>("all");
  const [visibilityFilter, setVisibilityFilter] =
    useState<SearchVisibilityFilter>("all");
  const [viewMode, setViewMode] = useResultsViewMode("compact");
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [linkOptionsTarget, setLinkOptionsTarget] =
    useState<LinkResponseDto | null>(null);
  const [collectionOptionsTarget, setCollectionOptionsTarget] =
    useState<CollectionResponseDto | null>(null);

  const filteredLinks = useMemo(() => {
    if (typeFilter === "collections") return [];
    let result = links;
    if (visibilityFilter === "public") {
      result = result.filter((l) => l.visibility === "public");
    } else if (visibilityFilter === "private") {
      result = result.filter((l) => l.visibility === "private");
    }
    return result;
  }, [links, typeFilter, visibilityFilter]);

  const filteredCollections = useMemo(() => {
    if (typeFilter === "links") return [];
    let result = collections;
    if (visibilityFilter === "public") {
      result = result.filter((c) => c.visibility === "public");
    } else if (visibilityFilter === "private") {
      result = result.filter((c) => c.visibility === "private");
    }
    return result;
  }, [collections, typeFilter, visibilityFilter]);

  const sections = useMemo<ResultsViewSection[]>(() => {
    const linkSection: ResultsViewSection = {
      key: "links",
      type: "links",
      title: t("searchScreen.sectionLinks", { count: filteredLinks.length }),
      items: filteredLinks,
    };
    const collectionSection: ResultsViewSection = {
      key: "collections",
      type: "collections",
      title: t("searchScreen.sectionCollections", {
        count: filteredCollections.length,
      }),
      items: filteredCollections,
    };
    return [linkSection, collectionSection];
  }, [filteredLinks, filteredCollections, t]);

  const hasQuery = debouncedQuery.length > 0;
  const isTyping = searchText.trim().length > 0 && searchText.trim() !== debouncedQuery;
  const showSkeleton = isTyping || (isLoading && !isLocalResults);

  const handleLinkClick = useCallback(
    (link: LinkResponseDto) => {
      addRecentSearch(searchText);
      window.open(link.url, "_blank", "noopener,noreferrer");
    },
    [addRecentSearch, searchText],
  );

  const handleCollectionClick = useCallback(
    (collection: CollectionResponseDto) => {
      addRecentSearch(searchText);
      navigate(`/${collection.user.username}/${collection.slug}`);
    },
    [addRecentSearch, searchText, navigate],
  );

  const handlePickRecent = useCallback(
    (term: string) => {
      setSearchText(term);
      mobileInputRef.current?.focus();
    },
    [setSearchText],
  );

  const optionsAriaLabel = t("collectionHero.openOptions");
  const renderLinkActions = isAuthenticated
    ? (link: LinkResponseDto) => (
        <EntityActionKebab
          ariaLabel={optionsAriaLabel}
          onOpen={() => setLinkOptionsTarget(link)}
        />
      )
    : undefined;
  const renderCollectionActions = isAuthenticated
    ? (collection: CollectionResponseDto) => (
        <EntityActionKebab
          ariaLabel={optionsAriaLabel}
          onOpen={() => setCollectionOptionsTarget(collection)}
        />
      )
    : undefined;

  return (
    <>
      <Helmet>
        <title>{t("searchScreen.metaTitle")}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <SetOutletWidth value="wide" />

      <div className="flex flex-col gap-4">
        {/* Mobile-only on-page input. Desktop uses the navbar pill. */}
        <div className="lg:hidden">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-dim">
              <SearchIcon />
            </span>
            <input
              ref={mobileInputRef}
              type="text"
              role="searchbox"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t("searchScreen.placeholder")}
              autoCorrect="off"
              autoCapitalize="off"
              autoComplete="off"
              className="h-11 w-full rounded-full border border-neutral-700/50 bg-neutral-800/60 pl-10 pr-10 text-[15px] text-text placeholder:text-text-dim focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {searchText ? (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full text-text-dim transition-colors hover:bg-white/[0.06] hover:text-text cursor-pointer"
                aria-label={t("searchScreen.cancel")}
              >
                <CloseIcon />
              </button>
            ) : null}
          </div>
        </div>

        {hasQuery ? (
          <div className="flex items-center justify-between gap-3">
            <FilterChips
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              visibilityFilter={visibilityFilter}
              onVisibilityChange={setVisibilityFilter}
              className="min-w-0 flex-1"
            />
            <ResultsViewModeToggle
              mode={viewMode}
              onChange={setViewMode}
              className="shrink-0"
            />
          </div>
        ) : null}

        {isError && hasQuery ? (
          <ErrorState
            title={t("searchScreen.errorTitle")}
            description={t("searchScreen.errorBody")}
          />
        ) : (
          <ResultsView
            sections={hasQuery ? sections : []}
            highlightQuery={debouncedQuery}
            mode={viewMode}
            onModeChange={setViewMode}
            hideToggle
            loading={showSkeleton}
            skeleton={<SearchSkeleton />}
            emptyState={
              <SearchEmptyState
                isLoading={false}
                hasQuery={hasQuery}
                query={debouncedQuery}
                recentSearches={recentSearches}
                onPickRecent={handlePickRecent}
                onClearRecent={clearRecentSearches}
              />
            }
            onLinkClick={handleLinkClick}
            onCollectionClick={handleCollectionClick}
            {...(renderLinkActions ? { renderLinkActions } : {})}
            {...(renderCollectionActions ? { renderCollectionActions } : {})}
          />
        )}
      </div>

      {isAuthenticated ? (
        <>
          <LinkOptionsModal
            isOpen={!!linkOptionsTarget}
            link={linkOptionsTarget}
            context="home"
            onClose={() => setLinkOptionsTarget(null)}
          />
          <CollectionOptionsModal
            isOpen={!!collectionOptionsTarget}
            collection={collectionOptionsTarget}
            onClose={() => setCollectionOptionsTarget(null)}
          />
        </>
      ) : null}
    </>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
