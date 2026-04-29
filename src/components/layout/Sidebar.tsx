import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { useMyCollections } from "@/hooks/useMyCollections";
import { FOCUS_NAVBAR_SEARCH_EVENT } from "./NavbarSearch";
import {
  CollectionsIcon,
  LogoutIcon,
  PlusIcon,
  SearchIcon,
} from "./nav/icons";
import { NAV_ITEMS } from "./nav/items";
import { useIsCollectionDetail } from "./nav/useIsCollectionDetail";

interface SidebarProps {
  /**
   * Hook fired when the user clicks "+ New collection". Until the create flow
   * lands on web, the AppLayout supplies a `toast.info("Coming soon…")` so the
   * affordance still feels alive.
   */
  onNewCollection: () => void;
}

/**
 * Persistent left sidebar for authenticated views on lg+. Sits below the
 * Navbar (which owns brand + language toggle) and provides the primary nav
 * rail, the user's recent collections, and a profile/logout footer.
 */
export function Sidebar({ onNewCollection }: SidebarProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: collections, isLoading } = useMyCollections({ limit: 8 });
  const isCollectionDetail = useIsCollectionDetail();

  if (!user) return null;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <aside className="hidden lg:flex sticky top-16 h-[calc(100vh/0.95-4rem)] w-[260px] xl:w-[280px] shrink-0 flex-col border-r border-neutral-800/70 bg-background/60 backdrop-blur-xl">
      {/* Primary nav */}
      <nav className="flex flex-col gap-1 px-3 pt-5">
        <NavLink
          to="/search"
          onClick={() =>
            window.dispatchEvent(new CustomEvent(FOCUS_NAVBAR_SEARCH_EVENT))
          }
          className={({ isActive }) =>
            clsx(
              "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-text"
                : "text-text-dim hover:bg-white/[0.04] hover:text-text",
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive ? (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
                />
              ) : null}
              <SearchIcon
                width={18}
                height={18}
                className={clsx(
                  "shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-text-dim group-hover:text-text",
                )}
              />
              <span>{t("tabBar.search")}</span>
            </>
          )}
        </NavLink>
        {NAV_ITEMS.map(({ to, labelKey, Icon, end }) => {
          const forceActive = to === "/collections" && isCollectionDetail;
          return (
            <NavLink
              key={to}
              to={to}
              end={end ?? false}
              className={({ isActive }) => {
                const active = isActive || forceActive;
                return clsx(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-text"
                    : "text-text-dim hover:bg-white/[0.04] hover:text-text",
                );
              }}
            >
              {({ isActive }) => {
                const active = isActive || forceActive;
                return (
                  <>
                    {active ? (
                      <span
                        aria-hidden
                        className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
                      />
                    ) : null}
                    <Icon
                      width={18}
                      height={18}
                      className={clsx(
                        "shrink-0 transition-colors",
                        active
                          ? "text-primary"
                          : "text-text-dim group-hover:text-text",
                      )}
                    />
                    <span>{t(labelKey)}</span>
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </nav>

      {/* Recent collections */}
      <div className="mt-5 flex min-h-0 flex-1 flex-col px-3">
        <div className="relative flex min-h-0 max-h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-surface/60 to-surface/20 ring-1 ring-inset ring-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          {/* Top hairline highlight */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
          />

          {/* Header */}
          <div className="flex items-center justify-between px-3.5 pt-3 pb-2.5">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_0_rgba(0,255,153,0.7)]"
              />
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text">
                {t("sidebar.yourCollections")}
              </h3>
              {collections && collections.length > 0 ? (
                <span className="rounded-full bg-white/[0.06] px-1.5 py-px text-[10px] font-semibold tabular-nums text-text-dim">
                  {collections.length}
                </span>
              ) : null}
            </div>
            <Link
              to="/collections"
              className="group/all inline-flex items-center gap-0.5 text-[11px] font-medium text-text-dim transition-colors hover:text-primary"
            >
              {t("sidebar.seeAll")}
              <svg
                aria-hidden
                width={10}
                height={10}
                viewBox="0 0 10 10"
                className="-mr-0.5 transition-transform duration-200 group-hover/all:translate-x-0.5"
              >
                <path
                  d="M3 1.5 6.5 5 3 8.5"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </Link>
          </div>

          {/* Hairline gradient divider */}
          <span
            aria-hidden
            className="mx-3 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
          />

          {/* Body */}
          <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
            <button
              type="button"
              onClick={onNewCollection}
              className="group/new flex items-center gap-2.5 rounded-xl bg-white/[0.02] px-2 py-1.5 text-left text-[13px] font-medium text-text-dim ring-1 ring-inset ring-white/[0.06] transition-all hover:bg-primary/[0.06] hover:text-primary hover:ring-primary/30 cursor-pointer"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary/25 to-primary/5 text-primary ring-1 ring-inset ring-primary/25 transition-transform duration-200 group-hover/new:scale-105">
                <PlusIcon width={12} height={12} strokeWidth={2.8} />
              </span>
              <span className="flex-1">{t("sidebar.newCollection")}</span>
            </button>

            <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
              {isLoading ? (
                <CollectionListSkeleton />
              ) : collections && collections.length > 0 ? (
                <ul className="flex flex-col gap-0.5">
                  {collections.map((c) => (
                    <li key={c.id}>
                      <NavLink
                        to={`/${c.user.username}/${c.slug}`}
                        className={({ isActive }) =>
                          clsx(
                            "group/item relative flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors",
                            isActive
                              ? "bg-primary/10"
                              : "hover:bg-white/[0.04]",
                          )
                        }
                        title={c.name}
                      >
                        {({ isActive }) => (
                          <>
                            {isActive ? (
                              <span
                                aria-hidden
                                className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-primary"
                              />
                            ) : null}
                            <span
                              className={clsx(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ring-1 ring-inset transition-all duration-200",
                                isActive
                                  ? "from-primary/20 to-primary/[0.04] ring-primary/30"
                                  : "from-white/[0.05] to-white/[0.01] ring-white/[0.05] group-hover/item:from-primary/12 group-hover/item:to-primary/[0.02] group-hover/item:ring-primary/25",
                              )}
                            >
                              <CollectionsIcon
                                width={14}
                                height={14}
                                strokeWidth={1.8}
                                className={clsx(
                                  "transition-colors",
                                  isActive
                                    ? "text-primary"
                                    : "text-text-dim/80 group-hover/item:text-primary",
                                )}
                              />
                            </span>
                            <span
                              className={clsx(
                                "min-w-0 flex-1 truncate text-[13.5px] transition-colors",
                                isActive
                                  ? "font-medium text-text"
                                  : "text-text-dim group-hover/item:text-text",
                              )}
                            >
                              {c.name}
                            </span>
                            <span
                              className={clsx(
                                "shrink-0 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums transition-colors",
                                isActive
                                  ? "bg-primary/10 text-primary"
                                  : "bg-white/[0.04] text-text-dim/80 group-hover/item:bg-primary/10 group-hover/item:text-primary",
                              )}
                            >
                              {c.totalLinks}
                            </span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 px-3 py-6 text-center">
                  <span
                    aria-hidden
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.03] ring-1 ring-inset ring-white/[0.06]"
                  >
                    <CollectionsIcon
                      width={16}
                      height={16}
                      strokeWidth={1.6}
                      className="text-text-dim/60"
                    />
                  </span>
                  <p className="text-[12px] leading-snug text-text-dim/80">
                    {t("sidebar.empty")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: profile card + logout */}
      <div className="mt-3 border-t border-neutral-800/70 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Link
            to="/account"
            className="flex min-w-0 flex-1 items-center gap-3 no-underline"
          >
            <Avatar user={user} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-text">
                {fullName || `@${user.username}`}
              </p>
              <p className="truncate text-[11px] text-text-dim">
                @{user.username}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            aria-label={t("sidebar.logOut")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
            title={t("sidebar.logOut")}
          >
            <LogoutIcon width={18} height={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function CollectionListSkeleton() {
  return (
    <ul className="flex flex-col gap-0.5">
      {[0, 1, 2, 3].map((i) => (
        <li
          key={i}
          className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5"
        >
          <span className="h-7 w-7 shrink-0 animate-pulse rounded-md bg-white/[0.05] ring-1 ring-inset ring-white/[0.04]" />
          <span
            className="h-3 animate-pulse rounded bg-white/[0.05]"
            style={{ width: `${55 + ((i * 11) % 30)}%` }}
          />
          <span className="ml-auto h-4 w-6 shrink-0 animate-pulse rounded-md bg-white/[0.04]" />
        </li>
      ))}
    </ul>
  );
}
