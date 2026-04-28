import clsx from "clsx";
import { motion } from "framer-motion";
import { LANGUAGES, type Language } from "./languages";

interface LanguagePickerProps {
  selectedCode: string;
  onSelect: (language: Language) => void;
  isLoading?: boolean;
  changingCode?: string | null;
}

export function LanguagePicker({
  selectedCode,
  onSelect,
  isLoading = false,
  changingCode = null,
}: LanguagePickerProps) {
  return (
    <div className="flex flex-col gap-3">
      {LANGUAGES.map((language) => {
        const isSelected = language.code === selectedCode;
        const isPending = isLoading && changingCode === language.code;
        return (
          <button
            key={language.code}
            type="button"
            onClick={() => {
              if (isLoading || isSelected) return;
              onSelect(language);
            }}
            disabled={isLoading}
            aria-pressed={isSelected}
            className={clsx(
              "group flex w-full items-center justify-between gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isSelected
                ? "border-primary bg-primary/[0.08]"
                : "border-transparent bg-surface hover:border-neutral-700 hover:bg-surface-light",
              isLoading && "cursor-wait opacity-80",
            )}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl leading-none">{language.flag}</span>
              <div>
                <p
                  className={clsx(
                    "text-base font-semibold leading-tight",
                    isSelected ? "text-primary" : "text-text",
                  )}
                >
                  {language.nativeName}
                </p>
                <p className="mt-0.5 text-sm text-text-dim">{language.name}</p>
              </div>
            </div>

            <span
              className={clsx(
                "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                isSelected ? "bg-primary/20 text-primary" : "text-transparent",
              )}
              aria-hidden
            >
              {isPending ? (
                <span className="block h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <motion.svg
                  initial={false}
                  animate={{ scale: isSelected ? 1 : 0 }}
                  transition={{ duration: 0.18 }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </motion.svg>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
