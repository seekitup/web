import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CollectionLookupResponseDto } from "@/types/api";

export function useCollectionLookup(username: string, slug: string) {
  return useQuery<CollectionLookupResponseDto>({
    queryKey: ["collection", "lookup", username, slug],
    queryFn: () => api.collections.lookupBySlug(username, slug),
    enabled: !!username && !!slug,
    retry: false,
  });
}
