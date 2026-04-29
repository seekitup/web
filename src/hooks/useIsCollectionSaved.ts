import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { collectionKeys } from "@/lib/queryKeys";

/**
 * Mirrors the mobile `useIsCollectionSaved` — the lookup endpoint used by web
 * doesn't carry `isSaved`, so saved-state lives behind a dedicated GET that
 * each surface (currently the SaveCollectionBanner) fetches on demand.
 */
export function useIsCollectionSaved(collectionId: number | undefined) {
  const query = useQuery({
    queryKey: collectionKeys.savedCheck(collectionId ?? -1),
    queryFn: () => api.collections.isCollectionSaved(collectionId!),
    enabled: !!collectionId,
    staleTime: 30 * 1000,
  });

  return {
    isSaved: query.data?.saved ?? false,
    isLoading: query.isLoading,
    isFetched: query.isFetched,
  };
}
