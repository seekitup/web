import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";

export function UserMenu() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close the menu whenever the route changes (link click, back button, etc.)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [location.pathname]);

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

  if (!user) return null;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const isVerified = !!user.emailVerifiedAt;

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative flex items-center justify-center rounded-full transition-transform duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Open account menu"
      >
        <Avatar user={user} size={36} />
        {isVerified ? (
          <span
            className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background"
            aria-hidden
          />
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-2xl border border-neutral-800 bg-surface/95 backdrop-blur-xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] overflow-hidden"
          >
            <div className="flex items-start gap-3 p-4 border-b border-neutral-800">
              <Avatar user={user} size={40} />
              <div className="min-w-0 flex-1">
                {fullName ? (
                  <p className="truncate text-sm font-semibold text-text">
                    {fullName}
                  </p>
                ) : null}
                <p className="truncate text-xs text-text-dim">
                  @{user.username}
                </p>
                <p className="truncate text-xs text-text-dim mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>
            <nav className="py-1.5">
              <Link
                to="/account"
                role="menuitem"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-white/5 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-dim">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {t("accountScreen.title")}
              </Link>
              <Link
                to="/account/sessions"
                role="menuitem"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-white/5 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-dim">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                {t("accountSessionsScreen.title")}
              </Link>
            </nav>
            <div className="border-t border-neutral-800 py-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                {t("auth.logOut")}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
