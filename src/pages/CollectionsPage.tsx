import { useCallback, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useNavigate } from "react-router-dom";
import { SetOutletWidth } from "@/components/layout/OutletWidth";
import { ListPageHeader } from "@/components/list/ListPageHeader";
import { ListFilterRow } from "@/components/list/ListFilterRow";
import { ListEmptyState } from "@/components/list/ListEmptyState";
import { ListSkeleton } from "@/components/list/ListSkeleton";
import { InfiniteScrollSentinel } from "@/components/list/InfiniteScrollSentinel";
import { ResultsView } from "@/components/search/ResultsView";
import type { ResultsViewSection } from "@/components/search/ResultsView";
import { useResultsViewMode } from "@/hooks/useResultsViewMode";
import { useViewOptions } from "@/hooks/useViewOptions";
import { useInfiniteCollections } from "@/hooks/useInfiniteCollections";
import { useAuth } from "@/hooks/useAuth";
import { useCreateModal } from "@/components/create/createModalContext";
import { ErrorState } from "@/components/ui/ErrorState";
import { EntityActionKebab } from "@/components/collection/EntityActionKebab";
import { CollectionOptionsModal } from "@/components/collection/CollectionOptionsModal";
import { CollectionsIcon } from "@/components/layout/nav/icons";
import type { CollectionsFilter } from "@/lib/viewOptionsStorage";
import type { CollectionResponseDto } from "@/types/api";

export function CollectionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createModal = useCreateModal();
  const {
    options: { collectionsFilter, collectionsSortBy },
    setCollectionsFilter,
    setCollectionsSortBy,
  } = useViewOptions();
  const [viewMode, setViewMode] = useResultsViewMode("grid");
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [collectionOptionsTarget, setCollectionOptionsTarget] =
    useState<CollectionResponseDto | null>(null);

  const {
    items,
    total,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteCollections({
    filter: collectionsFilter,
    sortBy: collectionsSortBy,
  });

  const sections = useMemo<ResultsViewSection[]>(
    () => [
      { key: "collections", type: "collections", title: "", items },
    ],
    [items],
  );

  const filterOptions: { value: CollectionsFilter; label: string }[] = [
    { value: "all", label: t("collectionsScreen.filterAll") },
    { value: "my", label: t("collectionsScreen.filterMy") },
    { value: "invited", label: t("collectionsScreen.filterInvited") },
    { value: "pending", label: t("collectionsScreen.filterPending") },
    { value: "saved", label: t("collectionsScreen.filterSaved") },
  ];

  const openCreate = () =>
    createModal.open({ mode: "creating", tab: "collection" });

  const handleCollectionClick = useCallback(
    (collection: CollectionResponseDto) => {
      navigate(`/${collection.user.username}/${collection.slug}`);
    },
    [navigate],
  );

  const emptyState = buildEmptyState({
    t,
    filter: collectionsFilter,
    onCta: openCreate,
  });

  const optionsAriaLabel = t("collectionHero.openOptions");
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
        <title>{t("collectionsScreen.metaTitle")}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <SetOutletWidth value="wide" />

      <div className="flex flex-col gap-5">
        <ListPageHeader
          title={t("collectionsScreen.title")}
          subtitle={
            isLoading
              ? undefined
              : t("collectionsScreen.subtitleCount", { count: total })
          }
          cta={{
            label: t("collectionsScreen.newCollection"),
            onClick: openCreate,
          }}
        />

        <ListFilterRow
          filter={{
            value: collectionsFilter,
            onChange: setCollectionsFilter,
            options: filterOptions,
          }}
          sort={{
            value: collectionsSortBy,
            onChange: setCollectionsSortBy,
            label: t("collectionsScreen.sortLabel"),
            options: [
              {
                value: "createdAt",
                label: t("collectionsScreen.sortByCreated"),
              },
              {
                value: "lastViewedAt",
                label: t("collectionsScreen.sortByLastViewed"),
              },
            ],
          }}
          viewMode={{ value: viewMode, onChange: setViewMode }}
        />

        {isError ? (
          <ErrorState
            title={t("collectionsScreen.errorTitle")}
            description={t("collectionsScreen.errorBody")}
          />
        ) : (
          <ResultsView
            sections={sections}
            mode={viewMode}
            onModeChange={setViewMode}
            hideToggle
            hideSectionHeaders
            loading={isLoading}
            skeleton={<ListSkeleton mode={viewMode} type="collections" />}
            emptyState={emptyState}
            onCollectionClick={handleCollectionClick}
            addCard={{
              collections: {
                label: t("collectionsScreen.addCollectionGhost"),
                caption: t("collectionsScreen.addCollectionGhostCaption"),
                onClick: openCreate,
              },
            }}
            {...(renderCollectionActions ? { renderCollectionActions } : {})}
          />
        )}

        <InfiniteScrollSentinel
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      </div>

      {isAuthenticated ? (
        <CollectionOptionsModal
          isOpen={!!collectionOptionsTarget}
          collection={collectionOptionsTarget}
          onClose={() => setCollectionOptionsTarget(null)}
        />
      ) : null}
    </>
  );
}

function buildEmptyState({
  t,
  filter,
  onCta,
}: {
  t: TFunction;
  filter: CollectionsFilter;
  onCta: () => void;
}) {
  const icon = <CollectionsIcon width={28} height={28} />;
  if (filter === "invited") {
    return (
      <ListEmptyState
        icon={icon}
        title={t("collectionsScreen.emptyInvitedTitle")}
        subtitle={t("collectionsScreen.emptyInvitedSubtitle")}
      />
    );
  }
  if (filter === "pending") {
    return (
      <ListEmptyState
        icon={icon}
        title={t("collectionsScreen.emptyPendingTitle")}
        subtitle={t("collectionsScreen.emptyPendingSubtitle")}
      />
    );
  }
  if (filter === "saved") {
    return (
      <ListEmptyState
        icon={icon}
        title={t("collectionsScreen.emptySavedTitle")}
        subtitle={t("collectionsScreen.emptySavedSubtitle")}
      />
    );
  }
  if (filter === "my") {
    return (
      <ListEmptyState
        icon={icon}
        title={t("collectionsScreen.emptyMyTitle")}
        subtitle={t("collectionsScreen.emptyMySubtitle")}
        ctaLabel={t("collectionsScreen.emptyMyCta")}
        onCta={onCta}
      />
    );
  }
  return (
    <ListEmptyState
      icon={icon}
      title={t("collectionsScreen.emptyAllTitle")}
      subtitle={t("collectionsScreen.emptyAllSubtitle")}
      ctaLabel={t("collectionsScreen.emptyAllCta")}
      onCta={onCta}
    />
  );
}
