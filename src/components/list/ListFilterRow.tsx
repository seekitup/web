import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ResultsViewModeToggle } from "@/components/search/ResultsView";
import type { ResultsViewMode } from "@/components/search/ResultsView";
import type { SortByOption } from "@/lib/viewOptionsStorage";

interface FilterOption<T extends string> {
  value: T;
  label: string;
}

export interface ListFilterRowProps<F extends string> {
  filter: {
    value: F;
    onChange: (next: F) => void;
    options: FilterOption<F>[];
  };
  visibility?: {
    value: "public" | "private" | undefined;
    onChange: (next: "public" | "private" | undefined) => void;
    publicLabel: string;
    privateLabel: string;
  };
  sort: {
    value: SortByOption;
    onChange: (next: SortByOption) => void;
    label: string;
    options: { value: SortByOption; label: string }[];
  };
  viewMode: {
    value: ResultsViewMode;
    onChange: (next: ResultsViewMode) => void;
  };
  className?: string;
}

export function ListFilterRow<F extends string>({
  filter,
  visibility,
  sort,
  viewMode,
  className,
}: ListFilterRowProps<F>) {
  return (
    <div
      className={clsx(
        "flex flex-wrap items-center gap-2 sm:gap-3",
        className,
      )}
      role="toolbar"
      aria-label="List filters"
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {filter.options.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              active={filter.value === opt.value}
              onClick={() => filter.onChange(opt.value)}
            />
          ))}
        </div>
        {visibility ? (
          <>
            <span
              aria-hidden
              className="mx-1 hidden h-5 w-px shrink-0 self-center bg-neutral-800 sm:block"
            />
            <div className="flex flex-nowrap items-center gap-2">
              <Chip
                label={visibility.publicLabel}
                active={visibility.value === "public"}
                onClick={() =>
                  visibility.onChange(
                    visibility.value === "public" ? undefined : "public",
                  )
                }
              />
              <Chip
                label={visibility.privateLabel}
                active={visibility.value === "private"}
                onClick={() =>
                  visibility.onChange(
                    visibility.value === "private" ? undefined : "private",
                  )
                }
              />
            </div>
          </>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <SortMenu
          label={sort.label}
          value={sort.value}
          options={sort.options}
          onChange={sort.onChange}
        />
        <ResultsViewModeToggle
          mode={viewMode.value}
          onChange={viewMode.onChange}
        />
      </div>
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

interface SortMenuProps {
  label: string;
  value: SortByOption;
  options: { value: SortByOption; label: string }[];
  onChange: (next: SortByOption) => void;
}

function SortMenu({ label, value, options, onChange }: SortMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const activeLabel = options.find((o) => o.value === value)?.label ?? "";

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "flex items-center gap-1.5 rounded-full border border-[#414141] px-3 py-1.5 text-[13px] font-medium transition-all duration-150 cursor-pointer",
          open
            ? "border-primary text-primary"
            : "text-text-dim hover:text-text hover:border-neutral-600",
        )}
      >
        <SortIcon />
        <span className="hidden sm:inline">{label}:</span>
        <span className="font-semibold text-text">{activeLabel}</span>
        <ChevronIcon className={open ? "rotate-180" : ""} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full z-30 mt-2 min-w-[180px] rounded-xl border border-neutral-800 bg-surface p-1 shadow-lg shadow-black/30"
          >
            {options.map((opt) => {
              const isActive = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={clsx(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-text hover:bg-white/[0.04]",
                  )}
                >
                  <span
                    className={clsx(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                      isActive
                        ? "border-primary bg-primary text-background"
                        : "border-neutral-600",
                    )}
                  >
                    {isActive ? <CheckIcon /> : null}
                  </span>
                  <span className="flex-1">{opt.label}</span>
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SortIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="6" y1="12" x2="18" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`transition-transform duration-150 ${className}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width={10}
      height={10}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
