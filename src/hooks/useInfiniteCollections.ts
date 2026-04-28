import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type {
  CollectionResponseDto,
  CollectionsQueryParams,
} from "@/types/api";

const DEFAULT_PAGE_SIZE = 20;

export type InfiniteCollectionsParams = Omit<
  CollectionsQueryParams,
  "page" | "limit"
> & {
  pageSize?: number;
};

export function useInfiniteCollections(
  params: InfiniteCollectionsParams = {},
  options: { enabled?: boolean } = {},
) {
  const { isAuthenticated } = useAuth();
  const { pageSize = DEFAULT_PAGE_SIZE, ...rest } = params;

  const query = useInfiniteQuery({
    queryKey: ["collections", "infinite", { ...rest, pageSize }],
    queryFn: ({ pageParam }) =>
      api.collections.list({ ...rest, page: pageParam, limit: pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
    enabled: isAuthenticated && (options.enabled ?? true),
    staleTime: 30_000,
  });

  const items = useMemo<CollectionResponseDto[]>(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  );
  const total = query.data?.pages[0]?.meta.total ?? 0;

  return {
    ...query,
    items,
    total,
  };
}
