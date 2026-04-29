import type { QueryClient } from "@tanstack/react-query";
import { collectionKeys, linkKeys, searchKeys } from "./queryKeys";

/**
 * Invalidate every cache that depends on a single collection's identity:
 *   - the slug-keyed lookup driving the detail page header
 *     (covers isPublic, name, description, totalLinks, members, childCollections)
 *   - all collection list queries (sidebar, my-collections, infinite list)
 *   - the per-collection link list (auth + public infinite queries)
 *
 * Uses prefix-matching: ["collection"] also matches the lookup at
 * ["collection", "lookup", username, slug] without us needing the slug here.
 */
export function invalidateCollection(qc: QueryClient, collectionId: number) {
  qc.invalidateQueries({ queryKey: collectionKeys.all() });
  qc.invalidateQueries({ queryKey: collectionKeys.list() });
  qc.invalidateQueries({ queryKey: collectionKeys.myAll() });
  qc.invalidateQueries({ queryKey: linkKeys.inCollection(collectionId) });
  qc.invalidateQueries({ queryKey: linkKeys.publicInCollection(collectionId) });
}

/**
 * Invalidate every cache touched by a link mutation:
 *   - all link queries (global lists, infinite, by-id)
 *   - search results (links surface there)
 *   - every collection the link belongs to (for totalLinks, embedded link lists)
 */
export function invalidateLink(
  qc: QueryClient,
  link: { id: number; collections?: { id: number }[] | null },
) {
  qc.invalidateQueries({ queryKey: linkKeys.all() });
  qc.invalidateQueries({ queryKey: linkKeys.byId(link.id) });
  qc.invalidateQueries({ queryKey: searchKeys.all() });
  for (const c of link.collections ?? []) {
    invalidateCollection(qc, c.id);
  }
}

/**
 * Fallback for link mutations that don't return a link object (e.g. delete).
 * We don't know which collections the link belonged to, so invalidate broadly.
 */
export function invalidateAllLinkScopes(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: linkKeys.all() });
  qc.invalidateQueries({ queryKey: collectionKeys.all() });
  qc.invalidateQueries({ queryKey: collectionKeys.list() });
  qc.invalidateQueries({ queryKey: collectionKeys.myAll() });
  qc.invalidateQueries({ queryKey: searchKeys.all() });
}
