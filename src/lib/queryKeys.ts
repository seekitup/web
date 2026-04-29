/**
 * Centralized React Query key factories. Every query and every invalidation
 * goes through these so a typo can never silently produce a non-matching key.
 *
 * Prefix-matching cheat sheet:
 *   ["collection"]       matches all collection-scoped queries (lookup, etc.)
 *   ["collections"]      matches all collection-list queries (plural, separate)
 *   ["links"]            matches all link queries (list, infinite, in-collection)
 */

export const collectionKeys = {
  all: () => ["collection"] as const,
  lookup: (username: string, slug: string) =>
    ["collection", "lookup", username, slug] as const,
  members: (collectionId: number) =>
    ["collection", "members", collectionId] as const,
  savedCheck: (collectionId: number) =>
    ["collection", "saved-check", collectionId] as const,

  list: () => ["collections"] as const,
  listWithParams: <P>(params: P) => ["collections", params] as const,
  infinite: <P>(params: P) => ["collections", "infinite", params] as const,

  myAll: () => ["my-collections"] as const,
  my: <P>(params: P) => ["my-collections", params] as const,
};

export const linkKeys = {
  all: () => ["links"] as const,
  byId: (id: number) => ["link", id] as const,

  list: <P>(params: P) => ["links", params] as const,
  infinite: <P>(params: P) => ["links", "infinite", params] as const,

  inCollection: (collectionId: number | undefined) =>
    ["links", "collection", "infinite", collectionId] as const,
  publicInCollection: (collectionId: number | undefined) =>
    ["links", "public", "infinite", collectionId] as const,
};

export const searchKeys = {
  all: () => ["search"] as const,
  query: <P>(params: P) => ["search", params] as const,
};
