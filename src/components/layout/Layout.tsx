import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { AppBanner } from "./AppBanner";
import { Navbar } from "./Navbar";

const DISMISSED_KEY = "seekitup-banner-dismissed";

export function Layout() {
  const { pathname } = useLocation();
  const isDownload = pathname === "/download" || pathname === "/";
  const { i18n } = useTranslation();

  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return localStorage.getItem(DISMISSED_KEY) === "true";
  });

  useEffect(() => {
    if (bannerDismissed) {
      localStorage.setItem(DISMISSED_KEY, "true");
    }
  }, [bannerDismissed]);

  const bannerVisible = !bannerDismissed;

  // Non-download pages always need bottom padding for the banner.
  // Download page only needs it when the banner is visible (to keep content visually centered).
  const needsPadding = !isDownload || bannerVisible;

  return (
    <HelmetProvider>
      <Helmet>
        <html lang={i18n.language} />
      </Helmet>
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className={`flex flex-col flex-1${needsPadding ? " pb-20" : ""}`}>
          <Outlet />
        </main>
        <AppBanner
          dismissed={bannerDismissed}
          onDismiss={() => setBannerDismissed(true)}
        />
      </div>
    </HelmetProvider>
  );
}
