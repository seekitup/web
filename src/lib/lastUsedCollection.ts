const KEY = "lastUsedCollectionId";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getLastUsedCollectionId(): number | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function setLastUsedCollectionId(id: number | null): void {
  if (!isBrowser()) return;
  if (id == null) {
    localStorage.removeItem(KEY);
    return;
  }
  localStorage.setItem(KEY, String(id));
}

export function clearLastUsedCollectionId(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY);
}
