import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import clsx from "clsx";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { addRecentSearch } from "@/lib/recentSearchesStorage";

const SEARCH_PATH = "/search";

/**
 * Fires when another part of the UI (e.g. the sidebar Search nav item) wants
 * the navbar search input to grab focus after navigating to /search.
 */
export const FOCUS_NAVBAR_SEARCH_EVENT = "focus-navbar-search";

/**
 * Search affordance in the Navbar. On desktop renders a wide pill input that
 * writes its query into the URL (`?q=`). On mobile renders a single icon
 * button that navigates to /search where the page's own input takes over.
 */
export function NavbarSearch() {
  const isDesktop = useIsDesktop();
  if (isDesktop) return <DesktopSearchInput />;
  return <MobileSearchButton />;
}

function DesktopSearchInput() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const onSearchPath = location.pathname === SEARCH_PATH;
  const urlQuery = onSearchPath ? (searchParams.get("q") ?? "") : "";

  const [text, setText] = useState(urlQuery);
  const debouncedText = useDebouncedValue(text, 200);

  // When pathname becomes /search (e.g., back/forward landing), sync URL → input.
  useEffect(() => {
    if (onSearchPath) {
      const fromUrl = searchParams.get("q") ?? "";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText((current) => (current === fromUrl ? current : fromUrl));
    }
  }, [onSearchPath, searchParams]);

  // When user navigates *away* from /search (clicks a sidebar item, etc.),
  // clear the navbar input so we don't leak stale query into the next visit.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!onSearchPath) setText("");
  }, [onSearchPath]);

  // Push debounced text into the URL — only meaningful while on /search,
  // since focusing the input is what takes us there in the first place.
  useEffect(() => {
    if (debouncedText !== text) return;
    if (!onSearchPath) return;
    const current = searchParams.get("q") ?? "";
    if (current === debouncedText) return;
    setSearchParams(debouncedText ? { q: debouncedText } : {}, {
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedText]);

  // Focusing the navbar input is the entry point to search — clicking or
  // tabbing into it sends the user to /search if they aren't already there.
  const handleFocus = useCallback(() => {
    if (!onSearchPath) navigate(SEARCH_PATH);
  }, [onSearchPath, navigate]);

  // Cmd+K / Ctrl+K focus.
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);
  useKeyboardShortcut(
    [
      { key: "k", meta: true },
      { key: "k", ctrl: true },
    ],
    (e) => {
      e.preventDefault();
      focusInput();
    },
  );

  // Sidebar (or anywhere else) can request focus via this custom event after
  // navigating to /search. The input is always mounted on desktop, so just
  // pull focus when asked.
  useEffect(() => {
    const handler = () => focusInput();
    window.addEventListener(FOCUS_NAVBAR_SEARCH_EVENT, handler);
    return () =>
      window.removeEventListener(FOCUS_NAVBAR_SEARCH_EVENT, handler);
  }, [focusInput]);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed) return;
      addRecentSearch(trimmed);
      if (!onSearchPath) {
        navigate(`${SEARCH_PATH}?q=${encodeURIComponent(trimmed)}`);
      } else {
        setSearchParams({ q: trimmed }, { replace: true });
      }
    },
    [text, onSearchPath, navigate, setSearchParams],
  );

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="hidden lg:flex relative w-full max-w-xl flex-1 mx-2"
    >
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-dim">
        <SearchIcon />
      </span>
      <input
        ref={inputRef}
        type="text"
        role="searchbox"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={handleFocus}
        placeholder={t("searchScreen.navbarPlaceholder")}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        aria-label={t("searchScreen.placeholder")}
        className={clsx(
          "h-9 w-full rounded-full border bg-neutral-800/50 pl-9 pr-16 text-[14px] text-text placeholder:text-text-dim/80",
          "border-neutral-700/40 transition-colors",
          "focus:border-primary/50 focus:bg-neutral-800/80 focus:outline-none focus:ring-2 focus:ring-primary/20",
          "hover:border-neutral-600/60 hover:bg-neutral-800/70",
        )}
      />
      {text ? (
        <button
          type="button"
          onClick={() => {
            setText("");
            inputRef.current?.focus();
          }}
          aria-label={t("searchScreen.cancel")}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-text-dim transition-colors hover:bg-white/[0.06] hover:text-text cursor-pointer"
        >
          <CloseIcon />
        </button>
      ) : (
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden xl:flex items-center gap-0.5 rounded-md border border-neutral-700/60 bg-neutral-900/40 px-1.5 py-0.5 text-[10px] font-medium text-text-dim/80">
          <span>⌘</span>
          <span>K</span>
        </kbd>
      )}
    </form>
  );
}

function MobileSearchButton() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(SEARCH_PATH)}
      aria-label={t("searchScreen.placeholder")}
      className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800/50 hover:bg-neutral-700/60 border border-neutral-700/40 hover:border-neutral-600/60 transition-all duration-200 text-text cursor-pointer"
    >
      <SearchIcon />
    </button>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
