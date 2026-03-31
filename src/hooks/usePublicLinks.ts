import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { LinkResponseDto } from '@/types/api';

const PAGE_SIZE = 20;

export function usePublicLinks(collectionId: number | undefined) {
  return useInfiniteQuery({
    queryKey: ['links', 'public', 'infinite', collectionId],
    queryFn: ({ pageParam }) =>
      api.links.listPublic({
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
  });
}

export function flattenLinks(
  pages: { data: LinkResponseDto[] }[] | undefined,
): LinkResponseDto[] {
  if (!pages) return [];
  return pages.flatMap((page) => page.data);
}
