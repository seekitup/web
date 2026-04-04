import { useTranslation } from 'react-i18next';

interface AppBannerProps {
  dismissed: boolean;
  onDismiss: () => void;
}

export function AppBanner({ dismissed, onDismiss: _onDismiss }: AppBannerProps) {
  const { t } = useTranslation();
  if (dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto max-w-xl flex items-center justify-between px-4 py-3 gap-3">
        {/* Logo + Text */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/logo-square.png" alt="SeekItUp" className="w-6 h-6 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{t('common.seekitup')}</p>
            <p className="text-white/60 text-xs truncate">{t('appBanner.tagline')}</p>
          </div>
        </div>

        {/* CTA + Close */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="bg-primary/40 text-black/60 text-sm font-semibold px-4 py-2 rounded-full transition-colors no-underline cursor-not-allowed"
          >
            {t('common.comingSoon')}
          </span>
          {/* <button
            onClick={onDismiss}
            className="text-white/50 hover:text-white transition-colors p-1"
            aria-label={t('appBanner.dismiss')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button> */}
        </div>
      </div>
    </div>
  );
}
