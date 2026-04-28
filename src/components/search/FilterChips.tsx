import clsx from "clsx";
import { useTranslation } from "react-i18next";

export type SearchTypeFilter = "all" | "links" | "collections";
export type SearchVisibilityFilter = "all" | "public" | "private";

interface FilterChipsProps {
  typeFilter: SearchTypeFilter;
  onTypeChange: (next: SearchTypeFilter) => void;
  visibilityFilter: SearchVisibilityFilter;
  onVisibilityChange: (next: SearchVisibilityFilter) => void;
  className?: string;
}

export function FilterChips({
  typeFilter,
  onTypeChange,
  visibilityFilter,
  onVisibilityChange,
  className,
}: FilterChipsProps) {
  const { t } = useTranslation();

  const toggleVisibility = (next: Exclude<SearchVisibilityFilter, "all">) => {
    onVisibilityChange(visibilityFilter === next ? "all" : next);
  };

  return (
    <div
      className={clsx(
        "flex w-full gap-2 overflow-x-auto py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      role="toolbar"
      aria-label="Filters"
    >
      <Chip
        label={t("searchScreen.filterAll")}
        active={typeFilter === "all"}
        onClick={() => onTypeChange("all")}
      />
      <Chip
        label={t("searchScreen.filterLinks")}
        active={typeFilter === "links"}
        onClick={() => onTypeChange("links")}
      />
      <Chip
        label={t("searchScreen.filterCollections")}
        active={typeFilter === "collections"}
        onClick={() => onTypeChange("collections")}
      />
      <span
        aria-hidden
        className="mx-1 h-5 w-px shrink-0 self-center bg-neutral-800"
      />
      <Chip
        label={t("searchScreen.filterPublic")}
        active={visibilityFilter === "public"}
        onClick={() => toggleVisibility("public")}
      />
      <Chip
        label={t("searchScreen.filterPrivate")}
        active={visibilityFilter === "private"}
        onClick={() => toggleVisibility("private")}
      />
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-150 cursor-pointer active:scale-95",
        active
          ? "bg-primary text-background font-bold"
          : "bg-neutral-800/80 text-text-dim hover:bg-neutral-700/80 hover:text-text",
      )}
    >
      {label}
    </button>
  );
}
