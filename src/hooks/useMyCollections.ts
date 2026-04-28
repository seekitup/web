import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { CollectionResponseDto } from "@/types/api";

interface UseMyCollectionsOptions {
  limit?: number;
}

/**
 * Lists the user's own collections, ordered by recency. Used by the sidebar
 * to surface a quick-access list with a "+ New collection" CTA.
 */
export function useMyCollections({ limit = 8 }: UseMyCollectionsOptions = {}) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["my-collections", { limit }],
    queryFn: () =>
      api.collections.list({
        filter: "my",
        sortBy: "lastViewedAt",
        limit,
        page: 1,
      }),
    enabled: isAuthenticated,
    staleTime: 60_000,
    select: (res): CollectionResponseDto[] => res.data,
  });
}
