import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { AppBanner } from "./AppBanner";
import { Navbar } from "./Navbar";

const DISMISSED_KEY = "seekitup-banner-dismissed";

export function Layout() {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();

  // Pages that own their own download CTA — don't double up with the banner.
  const isHome = pathname === "/" || pathname === "/download";

  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return localStorage.getItem(DISMISSED_KEY) === "true";
  });

  useEffect(() => {
    if (bannerDismissed) {
      localStorage.setItem(DISMISSED_KEY, "true");
    }
  }, [bannerDismissed]);

  const showBanner = !isHome && !bannerDismissed;

  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
      </Helmet>
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className={`flex flex-col flex-1${showBanner ? " pb-20" : ""}`}>
          <Outlet />
        </main>
        {showBanner ? (
          <AppBanner
            dismissed={bannerDismissed}
            onDismiss={() => setBannerDismissed(true)}
          />
        ) : null}
      </div>
    </>
  );
}
