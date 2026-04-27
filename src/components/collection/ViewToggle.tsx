import { useTranslation } from "react-i18next";

interface ViewToggleProps {
  view: "list" | "grid";
  onViewChange: (view: "list" | "grid") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full px-4">
      <div className="flex w-full border border-[#414141] rounded-full overflow-hidden">
        <button
          onClick={() => onViewChange("list")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full border transition-all duration-200 cursor-pointer ${
            view === "list"
              ? "border-primary text-primary"
              : "border-transparent text-[#414141] hover:text-[#6E6E6E]"
          }`}
          aria-label={t("viewToggle.listView")}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <polyline points="21 15 21 21 15 21" />
            <polyline points="3 9 3 3 9 3" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
            <line x1="21" y1="21" x2="14" y2="14" />
            <line x1="3" y1="3" x2="10" y2="10" />
          </svg>
          <span className="text-sm font-medium">
            {t("viewToggle.complete")}
          </span>
        </button>
        <button
          onClick={() => onViewChange("grid")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full border transition-all duration-200 cursor-pointer ${
            view === "grid"
              ? "border-primary text-primary"
              : "border-transparent text-[#414141] hover:text-[#6E6E6E]"
          }`}
          aria-label={t("viewToggle.gridView")}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
          >
            <rect x="2" y="2" width="9" height="9" rx="2" />
            <rect x="13" y="2" width="9" height="9" rx="2" />
            <rect x="2" y="13" width="9" height="9" rx="2" />
            <rect x="13" y="13" width="9" height="9" rx="2" />
          </svg>
          <span className="text-sm font-medium">{t("viewToggle.grid")}</span>
        </button>
      </div>
    </div>
  );
}
