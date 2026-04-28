const KEY = "seekitup.recentSearches.v1";
const MAX = 10;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getRecentSearches(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === "string").slice(0, MAX);
  } catch {
    return [];
  }
}

export function addRecentSearch(term: string): string[] {
  const trimmed = term.trim();
  if (!trimmed) return getRecentSearches();
  const prev = getRecentSearches();
  const dedup = prev.filter(
    (s) => s.toLowerCase() !== trimmed.toLowerCase(),
  );
  const next = [trimmed, ...dedup].slice(0, MAX);
  if (!isBrowser()) return next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota / SSR */
  }
  return next;
}

export function clearRecentSearches(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
