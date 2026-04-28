import { useCallback, useState } from "react";
import {
  DEFAULT_VIEW_OPTIONS,
  clearViewOptions,
  getViewOptions,
  setViewOptions as persistViewOptions,
  type CollectionsFilter,
  type LinksFilter,
  type LinksVisibility,
  type SortByOption,
  type ViewOptions,
} from "@/lib/viewOptionsStorage";

export type {
  CollectionsFilter,
  LinksFilter,
  LinksVisibility,
  SortByOption,
  ViewOptions,
};

export function useViewOptions() {
  const [options, setOptionsState] = useState<ViewOptions>(getViewOptions);

  const update = useCallback((partial: Partial<ViewOptions>) => {
    const next = persistViewOptions(partial);
    setOptionsState(next);
  }, []);

  const setLinksFilter = useCallback(
    (linksFilter: LinksFilter) => update({ linksFilter }),
    [update],
  );
  const setLinksSortBy = useCallback(
    (linksSortBy: SortByOption) => update({ linksSortBy }),
    [update],
  );
  const setLinksVisibility = useCallback(
    (linksVisibility: LinksVisibility) => update({ linksVisibility }),
    [update],
  );
  const setCollectionsFilter = useCallback(
    (collectionsFilter: CollectionsFilter) => update({ collectionsFilter }),
    [update],
  );
  const setCollectionsSortBy = useCallback(
    (collectionsSortBy: SortByOption) => update({ collectionsSortBy }),
    [update],
  );

  const reset = useCallback(() => {
    clearViewOptions();
    setOptionsState({ ...DEFAULT_VIEW_OPTIONS });
  }, []);

  return {
    options,
    setLinksFilter,
    setLinksSortBy,
    setLinksVisibility,
    setCollectionsFilter,
    setCollectionsSortBy,
    reset,
  };
}
