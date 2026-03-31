import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'es', flag: '🇪🇸' },
  { code: 'en', flag: '🇺🇸' },
] as const;

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const current = i18n.language?.split('-')[0] || 'es';

  const toggle = () => {
    const next = current === 'es' ? 'en' : 'es';
    i18n.changeLanguage(next);
  };

  const currentLang = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0];
  const nextLang = LANGUAGES.find((l) => l.code !== current) ?? LANGUAGES[1];

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-40 group flex items-center gap-0 bg-neutral-800/50 backdrop-blur-md rounded-full border border-neutral-700/40 hover:border-neutral-600/60 transition-all duration-300 overflow-hidden"
    >
      {/* Active language */}
      <span className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5">
        <span className="text-base leading-none">{currentLang.flag}</span>
        <span className="text-[11px] font-medium text-white/80 uppercase tracking-wide">
          {currentLang.code}
        </span>
      </span>

      {/* Divider */}
      <span className="w-px h-4 bg-neutral-600/40" />

      {/* Next language (dimmed) */}
      <span className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 opacity-40 group-hover:opacity-70 transition-opacity duration-200">
        <span className="text-base leading-none">{nextLang.flag}</span>
        <span className="text-[11px] font-medium text-white/60 uppercase tracking-wide">
          {nextLang.code}
        </span>
      </span>
    </button>
  );
}
