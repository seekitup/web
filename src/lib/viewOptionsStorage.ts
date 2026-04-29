export type LinksFilter = "all" | "my" | "shared";
export type CollectionsFilter = "all" | "my" | "invited" | "pending" | "saved";
export type SortByOption = "createdAt" | "lastViewedAt";
export type LinksVisibility = "public" | "private" | undefined;

export interface ViewOptions {
  linksFilter: LinksFilter;
  linksSortBy: SortByOption;
  linksVisibility: LinksVisibility;
  collectionsFilter: CollectionsFilter;
  collectionsSortBy: SortByOption;
}

export const DEFAULT_VIEW_OPTIONS: ViewOptions = {
  linksFilter: "all",
  linksSortBy: "createdAt",
  linksVisibility: undefined,
  collectionsFilter: "all",
  collectionsSortBy: "lastViewedAt",
};

const KEY = "seekitup.viewOptions.v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

const LINKS_FILTERS: readonly LinksFilter[] = ["all", "my", "shared"];
const COLLECTIONS_FILTERS: readonly CollectionsFilter[] = [
  "all",
  "my",
  "invited",
  "pending",
  "saved",
];
const SORT_OPTIONS: readonly SortByOption[] = ["createdAt", "lastViewedAt"];
const VISIBILITY_OPTIONS: readonly Exclude<LinksVisibility, undefined>[] = [
  "public",
  "private",
];

function isLinksFilter(v: unknown): v is LinksFilter {
  return typeof v === "string" && (LINKS_FILTERS as readonly string[]).includes(v);
}
function isCollectionsFilter(v: unknown): v is CollectionsFilter {
  return (
    typeof v === "string" &&
    (COLLECTIONS_FILTERS as readonly string[]).includes(v)
  );
}
function isSortBy(v: unknown): v is SortByOption {
  return typeof v === "string" && (SORT_OPTIONS as readonly string[]).includes(v);
}
function isVisibility(v: unknown): v is Exclude<LinksVisibility, undefined> {
  return (
    typeof v === "string" &&
    (VISIBILITY_OPTIONS as readonly string[]).includes(v)
  );
}

export function getViewOptions(): ViewOptions {
  if (!isBrowser()) return { ...DEFAULT_VIEW_OPTIONS };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_VIEW_OPTIONS };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { ...DEFAULT_VIEW_OPTIONS };
    }
    const p = parsed as Record<string, unknown>;
    const linksFilter = p["linksFilter"];
    const linksSortBy = p["linksSortBy"];
    const linksVisibility = p["linksVisibility"];
    const collectionsFilter = p["collectionsFilter"];
    const collectionsSortBy = p["collectionsSortBy"];
    return {
      linksFilter: isLinksFilter(linksFilter)
        ? linksFilter
        : DEFAULT_VIEW_OPTIONS.linksFilter,
      linksSortBy: isSortBy(linksSortBy)
        ? linksSortBy
        : DEFAULT_VIEW_OPTIONS.linksSortBy,
      linksVisibility: isVisibility(linksVisibility) ? linksVisibility : undefined,
      collectionsFilter: isCollectionsFilter(collectionsFilter)
        ? collectionsFilter
        : DEFAULT_VIEW_OPTIONS.collectionsFilter,
      collectionsSortBy: isSortBy(collectionsSortBy)
        ? collectionsSortBy
        : DEFAULT_VIEW_OPTIONS.collectionsSortBy,
    };
  } catch {
    return { ...DEFAULT_VIEW_OPTIONS };
  }
}

export function setViewOptions(partial: Partial<ViewOptions>): ViewOptions {
  const next: ViewOptions = { ...getViewOptions(), ...partial };
  if (!isBrowser()) return next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota / SSR */
  }
  return next;
}

export function clearViewOptions(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
