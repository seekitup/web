import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { searchKeys } from "@/lib/queryKeys";
import { filterCachedData } from "@/lib/searchCacheScan";
import type { SearchContext, SearchResponse } from "@/types/api";
import { useDebouncedValue } from "./useDebouncedValue";
import { useRecentSearches } from "./useRecentSearches";

interface UseSearchOptions {
  initialQuery?: string;
  context?: SearchContext;
}

/**
 * Two-phase search:
 *   1. Local cache scan (instant) — looks at already-fetched lists in React Query cache.
 *   2. Backend query (authoritative) — fires when debounced length >= 2.
 * Backend results override cache results once available.
 */
export function useSearch({ initialQuery = "", context }: UseSearchOptions = {}) {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState(initialQuery);
  const { recentSearches, addRecentSearch, clearRecentSearches } =
    useRecentSearches();

  const trimmedSearch = searchText.trim();
  const rawDebouncedQuery = useDebouncedValue(trimmedSearch, 500);
  // When the user clears the input, flip to empty immediately so the empty
  // state doesn't lag 500ms behind the clear action.
  const debouncedQuery = trimmedSearch === "" ? "" : rawDebouncedQuery;

  // Sync external initialQuery changes (e.g., browser back/forward updating ?q=)
  // into the local searchText. Only when external value is meaningfully different.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchText((current) => (current === initialQuery ? current : initialQuery));
  }, [initialQuery]);

  // Phase 1: local cache results, recomputed only when debouncedQuery changes.
  const localResults = useMemo(() => {
    if (!debouncedQuery) return { links: [], collections: [] };
    return filterCachedData(queryClient, debouncedQuery);
  }, [debouncedQuery, queryClient]);

  // Phase 2: backend search.
  const backendQuery = useQuery<SearchResponse>({
    queryKey: searchKeys.query({ q: debouncedQuery, context }),
    queryFn: () => api.search.search({ q: debouncedQuery, context }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60_000,
  });

  const hasBackendResults = !!backendQuery.data;
  const links = hasBackendResults
    ? backendQuery.data!.data.links
    : localResults.links;
  const collections = hasBackendResults
    ? backendQuery.data!.data.collections
    : localResults.collections;
  const totalLinks = hasBackendResults
    ? backendQuery.data!.meta.totalLinks
    : localResults.links.length;
  const totalCollections = hasBackendResults
    ? backendQuery.data!.meta.totalCollections
    : localResults.collections.length;

  const clearSearch = useCallback(() => {
    setSearchText("");
  }, []);

  return {
    searchText,
    setSearchText,
    debouncedQuery,
    clearSearch,
    links,
    collections,
    totalLinks,
    totalCollections,
    isLoading: backendQuery.isLoading && debouncedQuery.length >= 2,
    isFetching: backendQuery.isFetching,
    isError: backendQuery.isError,
    isLocalResults: !hasBackendResults && debouncedQuery.length > 0,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}
