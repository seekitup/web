import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useAuth } from "@/hooks/useAuth";
import { NavbarSearch } from "./NavbarSearch";
import { UserMenu } from "./UserMenu";

interface NavLinkDef {
  to: string;
  labelKey: string;
}

// When the rest of the mobile app gets ported, populate this and the center
// nav lights up automatically with active-route styling.
const NAV_LINKS: NavLinkDef[] = [];

function LanguageToggle() {
  const { i18n } = useTranslation();
  const current: "es" | "en" =
    i18n.language?.split("-")[0] === "en" ? "en" : "es";
  const toggle = () => {
    i18n.changeLanguage(current === "es" ? "en" : "es");
  };
  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-9 h-9 rounded-full bg-neutral-800/50 hover:bg-neutral-700/60 border border-neutral-700/40 hover:border-neutral-600/60 transition-all duration-200"
      aria-label={`Switch language from ${current.toUpperCase()}`}
    >
      <span className="text-[13px] font-bold leading-none text-white tracking-wide">
        {current.toUpperCase()}
      </span>
    </button>
  );
}

export function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 w-full border-b transition-all duration-200",
        scrolled
          ? "border-neutral-800/80 bg-background/80 backdrop-blur-xl shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]"
          : "border-neutral-800/40 bg-background/50 backdrop-blur-md",
      )}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <Link
            to={isAuthenticated ? "/home" : "/"}
            className="group flex items-center gap-2.5 no-underline shrink-0"
          >
            <img
              src="/logo-square.png"
              alt="Seekitup"
              className="w-7 h-7 object-contain transition-transform duration-200 group-hover:scale-110"
            />
            <span className="text-white text-[19px] font-extrabold tracking-tight hidden sm:inline">
              Seekitup
            </span>
          </Link>

          {/* Center: search (authenticated) or legacy nav links */}
          {isAuthenticated ? (
            <NavbarSearch />
          ) : NAV_LINKS.length > 0 ? (
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    clsx(
                      "relative px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-text"
                        : "text-text-dim hover:text-text",
                    )
                  }
                >
                  {t(link.labelKey)}
                </NavLink>
              ))}
            </nav>
          ) : null}

          {/* Right cluster */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageToggle />
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                {/* Desktop: separate Log in + Sign up */}
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center justify-center h-9 px-4 rounded-full text-sm font-medium text-text hover:text-primary transition-colors"
                >
                  {t("auth.logIn")}
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:inline-flex items-center justify-center h-9 px-5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-primary-light text-background shadow-[0_4px_16px_-6px_rgba(0,255,153,0.6)] hover:shadow-[0_4px_20px_-4px_rgba(0,255,153,0.8)] hover:brightness-110 transition-all"
                >
                  {t("auth.signUp")}
                </Link>
                {/* Mobile: single Get started */}
                <Link
                  to="/signup"
                  className="sm:hidden inline-flex items-center justify-center h-9 px-4 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-primary-light text-background shadow-[0_4px_16px_-6px_rgba(0,255,153,0.6)] hover:brightness-110 transition-all"
                >
                  {t("auth.getStarted")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
