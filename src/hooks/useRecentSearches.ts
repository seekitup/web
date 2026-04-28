import { useCallback, useState } from "react";
import {
  addRecentSearch as persistAddRecentSearch,
  clearRecentSearches as persistClearRecentSearches,
  getRecentSearches,
} from "@/lib/recentSearchesStorage";

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches);

  const addRecentSearch = useCallback((term: string) => {
    const next = persistAddRecentSearch(term);
    setRecentSearches(next);
  }, []);

  const clearRecentSearches = useCallback(() => {
    persistClearRecentSearches();
    setRecentSearches([]);
  }, []);

  return { recentSearches, addRecentSearch, clearRecentSearches };
}
