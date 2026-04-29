import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { linkKeys } from "@/lib/queryKeys";
import type { LinkResponseDto } from "@/types/api";

const PAGE_SIZE = 20;

/**
 * Authenticated, collection-scoped infinite link list. The backend honours the
 * caller's role on the collection — owners / editors / viewer-members see the
 * private + per-collection-private links they have access to; strangers see
 * only what `usePublicLinks` would have returned.
 *
 * Mirrors the shape of `usePublicLinks` so call-sites can swap one for the
 * other (and `flattenLinks` works on either result).
 */
export function useCollectionLinks(collectionId: number | undefined) {
  return useInfiniteQuery({
    queryKey: linkKeys.inCollection(collectionId),
    queryFn: ({ pageParam }) =>
      api.links.list({
        collectionId: collectionId!,
        page: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
    enabled: !!collectionId,
    staleTime: 30_000,
  });
}

export function flattenCollectionLinks(
  pages: { data: LinkResponseDto[] }[] | undefined,
): LinkResponseDto[] {
  if (!pages) return [];
  return pages.flatMap((page) => page.data);
}
