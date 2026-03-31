import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useLocation } from 'react-router-dom';
import { getStoreUrl } from '@/lib/platform';

interface AppBannerProps {
  dismissed: boolean;
  onDismiss: () => void;
}

export function AppBanner({ dismissed, onDismiss: _onDismiss }: AppBannerProps) {
  const { t } = useTranslation();
  const { username, slug } = useParams<{ username?: string; slug?: string }>();
  const { pathname } = useLocation();
  const isCollectionPage = !!username && !!slug && pathname === `/${username}/${slug}`;
  const storeUrl = getStoreUrl();

  const handleOpenInApp = useCallback(() => {
    if (!isCollectionPage || !username || !slug) return;

    const deepLink = `seekitup://collection/${username}/${slug}`;

    // Try to open the app via custom scheme.
    // If the app opens, the page gets backgrounded and the timeout won't fire.
    // If the app doesn't open, redirect to the store after a delay.
    const start = Date.now();
    const timeout = setTimeout(() => {
      if (Date.now() - start < 2000) {
        window.location.href = storeUrl ?? '/download';
      }
    }, 1500);

    const handleVisibility = () => {
      if (document.hidden) {
        clearTimeout(timeout);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    setTimeout(() => document.removeEventListener('visibilitychange', handleVisibility), 3000);

    window.location.href = deepLink;
  }, [isCollectionPage, username, slug, storeUrl]);

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
          {isCollectionPage ? (
            <button
              onClick={handleOpenInApp}
              className="bg-primary text-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary-dark transition-colors cursor-pointer"
            >
              {t('appBanner.openInApp')}
            </button>
          ) : storeUrl ? (
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary-dark transition-colors no-underline cursor-pointer"
            >
              {t('appBanner.getTheApp')}
            </a>
          ) : (
            <Link
              to="/download"
              className="bg-primary text-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary-dark transition-colors no-underline cursor-pointer"
            >
              {t('appBanner.getTheApp')}
            </Link>
          )}
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
