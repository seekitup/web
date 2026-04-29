import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { collectionKeys } from "@/lib/queryKeys";
import { useAuth } from "@/hooks/useAuth";
import type {
  CollectionResponseDto,
  CollectionsQueryParams,
} from "@/types/api";

export function useCollections(
  params: CollectionsQueryParams = {},
  options: { enabled?: boolean } = {},
) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: collectionKeys.listWithParams(params),
    queryFn: () => api.collections.list(params),
    enabled: isAuthenticated && (options.enabled ?? true),
    staleTime: 30_000,
    select: (res): CollectionResponseDto[] => res.data,
  });
}
