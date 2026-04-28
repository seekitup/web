import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { SearchSkeleton } from "./SearchSkeleton";

interface SearchEmptyStateProps {
  isLoading: boolean;
  hasQuery: boolean;
  query: string;
  recentSearches: string[];
  onPickRecent: (term: string) => void;
  onClearRecent: () => void;
}

export function SearchEmptyState({
  isLoading,
  hasQuery,
  query,
  recentSearches,
  onPickRecent,
  onClearRecent,
}: SearchEmptyStateProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="pt-2">
        <SearchSkeleton />
      </div>
    );
  }

  if (!hasQuery) {
    return (
      <div className="flex flex-col gap-10 pt-2">
        {recentSearches.length > 0 ? (
          <div className="px-2">
            <div className="mb-3 flex items-center justify-between px-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-dim">
                {t("searchScreen.recentSearches")}
              </h3>
              <button
                type="button"
                onClick={onClearRecent}
                className="text-[12px] font-medium text-primary transition-colors hover:text-primary-light cursor-pointer"
              >
                {t("searchScreen.clearAll")}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 px-2">
              {recentSearches.map((term, i) => (
                <motion.button
                  key={term}
                  type="button"
                  onClick={() => onPickRecent(term)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.04, 0.4) }}
                  className="rounded-full bg-neutral-800/80 px-4 py-1.5 text-[13px] font-medium text-text transition-colors hover:bg-neutral-700/80 cursor-pointer"
                >
                  {term}
                </motion.button>
              ))}
            </div>
          </div>
        ) : null}

        <SearchHeroEmptyState />
      </div>
    );
  }

  // Has query, no results
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="mb-2 text-[16px] font-semibold text-text">
        {t("searchScreen.noResults", { query })}
      </p>
      <p className="text-[14px] text-text-dim">
        {t("searchScreen.noResultsHint")}
      </p>
    </div>
  );
}

function SearchHeroEmptyState() {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-md flex-col items-center justify-center px-6 text-center"
    >
      {/* Hero tile */}
      <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] ring-1 ring-inset ring-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="text-text-dim"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <h2 className="mb-2 text-[18px] font-semibold tracking-tight text-text">
        {t("searchScreen.searchPrompt")}
      </h2>
      <p className="max-w-sm text-[14px] leading-relaxed text-text-dim">
        {t("searchScreen.emptyHint")}
      </p>

      {/* Keyboard shortcut hint (desktop only — mobile has no ⌘K) */}
      <div className="mt-6 hidden items-center gap-1.5 rounded-full border border-neutral-800/80 bg-neutral-900/40 px-3 py-1.5 text-[11.5px] text-text-dim/90 lg:inline-flex">
        <span>{t("searchScreen.shortcutHint")}</span>
        <kbd className="inline-flex items-center gap-0.5 rounded-md border border-neutral-700/60 bg-neutral-900/60 px-1.5 py-0.5 text-[10px] font-semibold tracking-tight text-text-dim">
          <span>⌘</span>
          <span>K</span>
        </kbd>
        <span>{t("searchScreen.navbarPlaceholder").toLowerCase()}</span>
      </div>
    </motion.div>
  );
}
