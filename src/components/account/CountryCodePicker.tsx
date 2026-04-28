import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { COUNTRIES, type Country } from "./countries";

interface CountryCodePickerProps {
  selectedCode: string | null;
  onSelect: (country: Country) => void;
}

export function CountryCodePicker({
  selectedCode,
  onSelect,
}: CountryCodePickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () =>
      COUNTRIES.find((c) => c.code === selectedCode) ??
      COUNTRIES.find((c) => c.code === "US")!,
    [selectedCode],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [search]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => searchInputRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [open]);

  const handleToggle = () => {
    setOpen((v) => {
      const next = !v;
      if (next) setSearch("");
      return next;
    });
  };

  const handlePick = (country: Country) => {
    onSelect(country);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={clsx(
          "flex h-12 items-center gap-2 rounded-xl border bg-surface px-3 text-[15px] transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          open
            ? "border-primary"
            : "border-neutral-700 hover:border-neutral-600",
        )}
      >
        <span className="text-xl leading-none">{selected.flag}</span>
        <span className="font-medium text-text">{selected.dialCode}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={clsx(
            "text-text-dim transition-transform",
            open && "rotate-180",
          )}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className="absolute left-0 z-50 mt-2 w-72 origin-top-left overflow-hidden rounded-2xl border border-neutral-800 bg-surface/95 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl"
          >
            <div className="border-b border-neutral-800 p-3">
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("accountPhoneScreen.searchCountry")}
                className="h-10 w-full rounded-lg border border-neutral-700 bg-surface-light px-3 text-sm text-text placeholder:text-text-dim/70 outline-none focus:border-primary"
              />
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-text-dim">
                  —
                </p>
              ) : (
                filtered.map((country) => {
                  const isSelected = country.code === selected.code;
                  return (
                    <button
                      key={country.code}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handlePick(country)}
                      className={clsx(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5",
                        isSelected && "bg-primary/10",
                      )}
                    >
                      <span className="text-xl leading-none">
                        {country.flag}
                      </span>
                      <span className="flex-1 text-sm text-text">
                        {country.name}
                      </span>
                      <span className="text-xs text-text-dim">
                        {country.dialCode}
                      </span>
                      {isSelected ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
