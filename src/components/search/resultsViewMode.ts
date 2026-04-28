export type ResultsViewMode = "compact" | "grid" | "complete";

export const ALL_RESULTS_VIEW_MODES: readonly ResultsViewMode[] = [
  "compact",
  "grid",
  "complete",
] as const;

const STORAGE_KEY = "seekitup.resultsViewMode.v1";

export function readPersistedResultsViewMode(): ResultsViewMode | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw &&
      (ALL_RESULTS_VIEW_MODES as readonly string[]).includes(raw)
      ? (raw as ResultsViewMode)
      : null;
  } catch {
    return null;
  }
}

export function persistResultsViewMode(mode: ResultsViewMode): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}
