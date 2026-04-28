import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
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
import { useInfiniteLinks } from "@/hooks/useInfiniteLinks";
import { useCreateModal } from "@/components/create/createModalContext";
import { ErrorState } from "@/components/ui/ErrorState";
import { LinksIcon } from "@/components/layout/nav/icons";
import type { LinksFilter } from "@/lib/viewOptionsStorage";

export function MyLinksPage() {
  const { t } = useTranslation();
  const createModal = useCreateModal();
  const {
    options: { linksFilter, linksSortBy, linksVisibility },
    setLinksFilter,
    setLinksSortBy,
    setLinksVisibility,
  } = useViewOptions();
  const [viewMode, setViewMode] = useResultsViewMode("grid");

  const {
    items,
    total,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteLinks({
    filter: linksFilter,
    sortBy: linksSortBy,
    ...(linksVisibility ? { visibility: linksVisibility } : {}),
  });

  const sections = useMemo<ResultsViewSection[]>(
    () => [
      { key: "links", type: "links", title: "", items },
    ],
    [items],
  );

  const filterOptions: { value: LinksFilter; label: string }[] = [
    { value: "all", label: t("myLinksScreen.filterAll") },
    { value: "my", label: t("myLinksScreen.filterMy") },
    { value: "shared", label: t("myLinksScreen.filterShared") },
  ];

  const openCreate = () =>
    createModal.open({ mode: "creating", tab: "link" });

  const emptyState = buildEmptyState({
    t,
    filter: linksFilter,
    hasVisibilityFilter: !!linksVisibility,
    onCta: openCreate,
  });

  return (
    <>
      <Helmet>
        <title>{t("myLinksScreen.metaTitle")}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <SetOutletWidth value="wide" />

      <div className="flex flex-col gap-5">
        <ListPageHeader
          title={t("myLinksScreen.title")}
          subtitle={
            isLoading
              ? undefined
              : t("myLinksScreen.subtitleCount", { count: total })
          }
          cta={{ label: t("myLinksScreen.newLink"), onClick: openCreate }}
        />

        <ListFilterRow
          filter={{
            value: linksFilter,
            onChange: setLinksFilter,
            options: filterOptions,
          }}
          visibility={{
            value: linksVisibility,
            onChange: setLinksVisibility,
            publicLabel: t("myLinksScreen.visibilityPublic"),
            privateLabel: t("myLinksScreen.visibilityPrivate"),
          }}
          sort={{
            value: linksSortBy,
            onChange: setLinksSortBy,
            label: t("myLinksScreen.sortLabel"),
            options: [
              { value: "createdAt", label: t("myLinksScreen.sortByCreated") },
              {
                value: "lastViewedAt",
                label: t("myLinksScreen.sortByLastViewed"),
              },
            ],
          }}
          viewMode={{ value: viewMode, onChange: setViewMode }}
        />

        {isError ? (
          <ErrorState
            title={t("myLinksScreen.errorTitle")}
            description={t("myLinksScreen.errorBody")}
          />
        ) : (
          <ResultsView
            sections={sections}
            mode={viewMode}
            onModeChange={setViewMode}
            hideToggle
            hideSectionHeaders
            loading={isLoading}
            skeleton={<ListSkeleton mode={viewMode} type="links" />}
            emptyState={emptyState}
            onLinkClick={(l) =>
              window.open(l.url, "_blank", "noopener,noreferrer")
            }
            addCard={{
              links: {
                label: t("myLinksScreen.addLinkGhost"),
                caption: t("myLinksScreen.addLinkGhostCaption"),
                onClick: openCreate,
              },
            }}
          />
        )}

        <InfiniteScrollSentinel
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      </div>
    </>
  );
}

function buildEmptyState({
  t,
  filter,
  hasVisibilityFilter,
  onCta,
}: {
  t: TFunction;
  filter: LinksFilter;
  hasVisibilityFilter: boolean;
  onCta: () => void;
}) {
  const icon = <LinksIcon width={28} height={28} />;
  if (hasVisibilityFilter) {
    return (
      <ListEmptyState
        icon={icon}
        title={t("myLinksScreen.emptyFilteredTitle")}
        subtitle={t("myLinksScreen.emptyFilteredSubtitle")}
      />
    );
  }
  if (filter === "shared") {
    return (
      <ListEmptyState
        icon={icon}
        title={t("myLinksScreen.emptySharedTitle")}
        subtitle={t("myLinksScreen.emptySharedSubtitle")}
      />
    );
  }
  if (filter === "my") {
    return (
      <ListEmptyState
        icon={icon}
        title={t("myLinksScreen.emptyMyTitle")}
        subtitle={t("myLinksScreen.emptyMySubtitle")}
        ctaLabel={t("myLinksScreen.emptyMyCta")}
        onCta={onCta}
      />
    );
  }
  return (
    <ListEmptyState
      icon={icon}
      title={t("myLinksScreen.emptyAllTitle")}
      subtitle={t("myLinksScreen.emptyAllSubtitle")}
      ctaLabel={t("myLinksScreen.emptyAllCta")}
      onCta={onCta}
    />
  );
}
