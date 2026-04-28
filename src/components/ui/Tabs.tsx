import clsx from "clsx";
import type { ReactNode } from "react";

export interface TabItem {
  key: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

/**
 * Outlined rounded-pill tabs that fill their container width. Inactive tabs
 * sit transparent inside the outer ring; the active tab paints a primary-
 * colored pill that visually replaces the section of the outer ring it covers.
 *
 * Visual parity with `<ViewToggle>` (CollectionPage Complete / Grid).
 */
export function Tabs({ items, activeKey, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={clsx(
        "flex w-full border border-[#414141] rounded-full overflow-hidden",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.key)}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full border transition-all duration-200 cursor-pointer outline-none",
              "focus-visible:ring-2 focus-visible:ring-primary/30",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-[#6E6E6E] hover:text-text",
            )}
          >
            {item.icon ? (
              <span className="flex shrink-0 items-center justify-center">
                {item.icon}
              </span>
            ) : null}
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
