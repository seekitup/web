import { Helmet } from "react-helmet-async";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { AppStoreBadges } from "@/components/download/AppStoreBadges";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
    titleKey: "homePage.featureSaveTitle",
    bodyKey: "homePage.featureSaveBody",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    titleKey: "homePage.featureOrganizeTitle",
    bodyKey: "homePage.featureOrganizeBody",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    titleKey: "homePage.featureShareTitle",
    bodyKey: "homePage.featureShareBody",
  },
];

export function HomePage() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();

  // Authenticated visitors at "/" go straight to /account (placeholder for future /home).
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{t("homePage.metaTitle")}</title>
        <meta name="description" content={t("homePage.metaDescription")} />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Ambient mesh */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-10%] left-[20%] h-[480px] w-[480px] rounded-full bg-primary/12 blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[10%] h-[400px] w-[400px] rounded-full bg-accent/8 blur-[140px]" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col items-center justify-center gap-12 px-6 py-12 lg:flex-row lg:gap-16 lg:py-20">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-light"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              {t("homePage.eyebrow")}
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="mt-6 text-[40px] font-black leading-[1.05] tracking-tight text-text sm:text-[56px] lg:text-[64px]"
            >
              {t("homePage.headlineStart")}{" "}
              <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                {t("homePage.headlineHighlight")}
              </span>{" "}
              {t("homePage.headlineEnd")}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-5 max-w-xl text-base leading-relaxed text-text-dim sm:text-lg"
            >
              {t("homePage.subhead")}
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            >
              <Link
                to="/signup"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary-light px-7 text-[15px] font-semibold text-background shadow-[0_8px_28px_-10px_rgba(0,255,153,0.7)] transition-all hover:brightness-110 hover:shadow-[0_8px_32px_-8px_rgba(0,255,153,0.9)]"
              >
                {t("homePage.primaryCta")}
              </Link>
              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-neutral-700 px-7 text-[15px] font-medium text-text transition-colors hover:border-primary hover:text-primary"
              >
                {t("homePage.secondaryCta")}
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex flex-1 items-center justify-center"
          >
            <motion.img
              src="/welcome.png"
              alt=""
              aria-hidden
              className="relative z-10 w-full max-w-[420px] select-none object-contain"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 6,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
            <div className="absolute inset-0 -z-0 m-auto h-[60%] w-[60%] rounded-full bg-primary/15 blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative bg-background">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
          <h2 className="mx-auto max-w-2xl text-center text-2xl font-bold text-text sm:text-3xl">
            {t("homePage.featuresTitle")}
          </h2>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.titleKey}
                className="group rounded-2xl border border-neutral-800 bg-surface p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary/25">
                  {feature.icon}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-text">
                  {t(feature.titleKey)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-dim">
                  {t(feature.bodyKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="relative overflow-hidden border-t border-neutral-800/60 bg-gradient-to-b from-background to-surface/30">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[120px]" />
        </div>
        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-20 text-center lg:py-24">
          <h2 className="text-3xl font-bold text-text sm:text-4xl">
            {t("homePage.downloadSectionTitle")}
          </h2>
          <p className="mt-4 max-w-lg text-base text-text-dim sm:text-lg">
            {t("homePage.downloadSectionBody")}
          </p>
          <div className="mt-10">
            <AppStoreBadges className="justify-center" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800/60 bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-8 text-sm text-text-dim sm:flex-row sm:justify-between">
          <p>
            {t("homePage.footerRights", { year: new Date().getFullYear() })}
          </p>
          <nav className="flex items-center gap-5">
            <Link to="/download" className="hover:text-text transition-colors">
              {t("homePage.footerDownload")}
            </Link>
            <span className="text-text-dim/60">{t("homePage.footerTagline")}</span>
          </nav>
        </div>
      </footer>
    </>
  );
}
