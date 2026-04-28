import { useCallback, useState } from "react";
import type { ResultsViewMode } from "@/components/search/resultsViewMode";
import {
  readPersistedResultsViewMode,
  persistResultsViewMode,
} from "@/components/search/resultsViewMode";

/**
 * Persisted view-mode pair. Useful when the toggle lives outside ResultsView
 * (e.g., placed inline with filter chips).
 */
export function useResultsViewMode(
  defaultMode: ResultsViewMode = "compact",
): [ResultsViewMode, (next: ResultsViewMode) => void] {
  const [mode, setModeState] = useState<ResultsViewMode>(
    () => readPersistedResultsViewMode() ?? defaultMode,
  );
  const setMode = useCallback((next: ResultsViewMode) => {
    setModeState(next);
    persistResultsViewMode(next);
  }, []);
  return [mode, setMode];
}
