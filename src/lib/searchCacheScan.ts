import type { QueryClient } from "@tanstack/react-query";
import type {
  CollectionResponseDto,
  LinkResponseDto,
  PaginatedResponse,
} from "@/types/api";

interface SearchCacheResults {
  links: LinkResponseDto[];
  collections: CollectionResponseDto[];
}

/**
 * Scans the React Query cache for already-fetched links/collections that match
 * the query. Provides instant results while the authoritative backend search
 * fetch is still in flight.
 *
 * Matches the same fields as the API: link.{title,url,domain,ogTitle,description}
 * and collection.{name,description}. Case-insensitive substring.
 */
export function filterCachedData(
  queryClient: QueryClient,
  query: string,
): SearchCacheResults {
  const q = query.toLowerCase();
  if (!q) return { links: [], collections: [] };

  // Prefix match — TanStack matches everything starting with `["links", ...]`.
  const linkQueries = queryClient.getQueriesData<
    PaginatedResponse<LinkResponseDto>
  >({ queryKey: ["links"] });

  const seenLinkIds = new Set<number>();
  const links: LinkResponseDto[] = [];

  for (const [, data] of linkQueries) {
    if (!data?.data) continue;
    for (const link of data.data) {
      if (seenLinkIds.has(link.id)) continue;
      const matches =
        link.title?.toLowerCase().includes(q) ||
        link.url?.toLowerCase().includes(q) ||
        link.domain?.toLowerCase().includes(q) ||
        link.ogTitle?.toLowerCase().includes(q) ||
        link.description?.toLowerCase().includes(q);
      if (matches) {
        seenLinkIds.add(link.id);
        links.push(link);
      }
    }
  }

  const collectionQueries = queryClient.getQueriesData<
    PaginatedResponse<CollectionResponseDto>
  >({ queryKey: ["collections"] });

  const seenCollectionIds = new Set<number>();
  const collections: CollectionResponseDto[] = [];

  for (const [, data] of collectionQueries) {
    if (!data?.data) continue;
    for (const collection of data.data) {
      if (seenCollectionIds.has(collection.id)) continue;
      const matches =
        collection.name?.toLowerCase().includes(q) ||
        collection.description?.toLowerCase().includes(q);
      if (matches) {
        seenCollectionIds.add(collection.id);
        collections.push(collection);
      }
    }
  }

  return { links, collections };
}
