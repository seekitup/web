import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";

export function AuthLayout() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const isCallback = location.pathname === "/auth/callback";

  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
      </Helmet>
      <div className="relative flex min-h-screen flex-col bg-background">
        {/* Subtle ambient glow — sets the tone before any content paints */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px]" />
          <div className="absolute bottom-0 right-0 h-[320px] w-[320px] translate-x-1/3 translate-y-1/3 rounded-full bg-accent/5 blur-[120px]" />
        </div>

        {!isCallback && <Navbar />}

        <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 md:py-16">
          <AnimatePresence mode="wait">
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
