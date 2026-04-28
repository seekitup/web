import clsx from "clsx";
import { useTranslation } from "react-i18next";
import type { CollectionResponseDto } from "@/types/api";

interface CollectionPickerTriggerProps {
  label: string;
  selectedCollectionIds: number[];
  collections: CollectionResponseDto[];
  onPress: () => void;
  onClear?: () => void;
  className?: string;
}

/**
 * Trigger row that opens the CollectionPickerDialog. Shows the placeholder,
 * a single name, or "N collections" depending on selection count.
 */
export function CollectionPickerTrigger({
  label,
  selectedCollectionIds,
  collections,
  onPress,
  onClear,
  className,
}: CollectionPickerTriggerProps) {
  const { t } = useTranslation();
  const count = selectedCollectionIds.length;
  const hasSelection = count > 0;

  let display = t("collectionPicker.placeholder");
  if (count === 1) {
    const c = collections.find((x) => x.id === selectedCollectionIds[0]);
    if (c) display = c.name;
  } else if (count > 1) {
    display = t("collectionPicker.multipleSelected", { count });
  }

  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-text-dim">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPress}
          className={clsx(
            "group relative flex h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border bg-surface px-3.5 text-left transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            hasSelection
              ? "border-primary/60 hover:border-primary"
              : "border-neutral-700 hover:border-neutral-600",
          )}
        >
          <span
            aria-hidden
            className={clsx(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
              hasSelection
                ? "bg-primary/15 text-primary"
                : "bg-neutral-800 text-text-dim",
            )}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </span>
          <span
            className={clsx(
              "min-w-0 flex-1 truncate text-[15px]",
              hasSelection ? "text-text font-medium" : "text-text-dim/80",
            )}
          >
            {display}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-text-dim group-hover:text-text transition-colors"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        {hasSelection && onClear ? (
          <button
            type="button"
            onClick={onClear}
            aria-label={t("common.delete")}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-800 text-text-dim hover:bg-danger/10 hover:text-danger hover:border-danger/40 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}
