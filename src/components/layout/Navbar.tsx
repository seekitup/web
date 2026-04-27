import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function Navbar() {
  const { i18n } = useTranslation();
  const current: "es" | "en" =
    i18n.language?.split("-")[0] === "en" ? "en" : "es";

  const toggle = () => {
    i18n.changeLanguage(current === "es" ? "en" : "es");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-neutral-800/50">
      <div className="mx-auto max-w-xl flex items-center justify-between px-4 h-14">
        {/* Logo + Name */}
        <Link to="/" className="flex items-center gap-3 no-underline">
          <img
            src="/logo-square.png"
            alt="Seekitup"
            className="w-5 h-5 object-contain"
          />
          <span className="text-white text-xl font-extrabold">Seekitup</span>
        </Link>

        {/* Language toggle – shows active language code */}
        <button
          onClick={toggle}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-neutral-800/50 hover:bg-neutral-700/60 border border-neutral-700/40 hover:border-neutral-600/60 transition-all duration-200"
          aria-label={`Switch language from ${current.toUpperCase()}`}
        >
          <span className="text-[13px] font-bold leading-none text-white tracking-wide">
            {current.toUpperCase()}
          </span>
        </button>
      </div>
    </header>
  );
}
