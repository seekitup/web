import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { collectionKeys } from "@/lib/queryKeys";
import type { CollectionLookupResponseDto } from "@/types/api";

export function useCollectionLookup(username: string, slug: string) {
  return useQuery<CollectionLookupResponseDto>({
    queryKey: collectionKeys.lookup(username, slug),
    queryFn: () => api.collections.lookupBySlug(username, slug),
    enabled: !!username && !!slug,
    retry: false,
  });
}
