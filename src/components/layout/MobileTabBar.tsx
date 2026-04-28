import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { PlusIcon } from "./nav/icons";
import { NAV_ITEMS } from "./nav/items";

interface MobileTabBarProps {
  onAddPress: () => void;
}

/**
 * Mobile bottom tab bar — direct visual port of the mobile app's CustomTabBar.
 * Four tabs split around a center floating "+" action button. Hidden on lg+
 * where the persistent sidebar takes over.
 */
export function MobileTabBar({ onAddPress }: MobileTabBarProps) {
  const { t } = useTranslation();

  // Mirror the mobile app: first two tabs left, FAB center, last two right.
  const left = NAV_ITEMS.slice(0, 2);
  const right = NAV_ITEMS.slice(2, 4);

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-neutral-800/40 bg-background/55 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/40 [-webkit-backdrop-filter:blur(28px)_saturate(160%)] [backdrop-filter:blur(28px)_saturate(160%)]"
    >
      <div className="flex items-center px-1 py-2">
        {left.map((item) => (
          <TabButton key={item.to} item={item} t={t} />
        ))}

        <div className="flex flex-1 items-center justify-center">
          <button
            type="button"
            onClick={onAddPress}
            aria-label={t("sidebar.add")}
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-background shadow-[0_8px_22px_-6px_rgba(0,255,153,0.55)] transition-transform duration-150 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <PlusIcon width={22} height={22} strokeWidth={2.8} />
          </button>
        </div>

        {right.map((item) => (
          <TabButton key={item.to} item={item} t={t} />
        ))}
      </div>
    </nav>
  );
}

function TabButton({
  item,
  t,
}: {
  item: (typeof NAV_ITEMS)[number];
  t: (k: string) => string;
}) {
  const { Icon } = item;
  return (
    <NavLink
      to={item.to}
      end={item.end ?? false}
      className={({ isActive }) =>
        clsx(
          "flex flex-1 flex-col items-center gap-1.5 rounded-lg px-1 py-1.5 transition-colors",
          isActive ? "text-text" : "text-text-dim",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            width={20}
            height={20}
            className={clsx(
              "transition-colors",
              isActive ? "text-primary" : "text-text-dim",
            )}
          />
          <span className="text-[10px] font-medium leading-none">
            {t(item.labelKey)}
          </span>
        </>
      )}
    </NavLink>
  );
}
