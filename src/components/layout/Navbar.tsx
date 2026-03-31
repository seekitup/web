import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const LANGUAGES = [
  { code: 'es', flag: '🇪🇸' },
  { code: 'en', flag: '🇺🇸' },
] as const;

export function Navbar() {
  const { i18n } = useTranslation();
  const current = i18n.language?.split('-')[0] || 'es';

  const toggle = () => {
    const next = current === 'es' ? 'en' : 'es';
    i18n.changeLanguage(next);
  };

  const currentLang = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-neutral-800/50">
      <div className="mx-auto max-w-xl flex items-center justify-between px-4 h-14">
        {/* Logo + Name */}
        <Link to="/" className="flex items-center gap-3 no-underline">
          <img src="/logo-square.png" alt="SeekItUp" className="w-5 h-5 object-contain" />
          <span className="text-white text-xl font-extrabold">SeekItUp</span>
        </Link>

        {/* Language toggle – only shows active flag */}
        <button
          onClick={toggle}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-neutral-800/50 hover:bg-neutral-700/60 border border-neutral-700/40 hover:border-neutral-600/60 transition-all duration-200"
          aria-label={`Switch language from ${currentLang.code}`}
        >
          <span className="text-lg leading-none">{currentLang.flag}</span>
        </button>
      </div>
    </header>
  );
}
