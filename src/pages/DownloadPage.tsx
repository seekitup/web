import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { AppStoreBadges } from "@/components/download/AppStoreBadges";

export function DownloadPage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("downloadPage.metaTitle")}</title>
        <meta name="description" content={t("downloadPage.metaDescription")} />
      </Helmet>

      <section className="relative flex flex-1 flex-col items-center justify-center text-center px-6 py-16 overflow-hidden">
        {/* Gradient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[250px] h-[250px] bg-primary/5 rounded-full blur-[80px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-xl"
        >
          {/* Logo */}
          <img
            src="/logo-square.png"
            alt="Seekitup"
            className="w-16 h-16 object-contain mx-auto mb-6"
          />

          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-3">
            {t("downloadPage.heading")}
            <span className="text-primary">
              {" "}
              {t("downloadPage.headingHighlight")}
            </span>{" "}
            {t("downloadPage.headingEnd")}
          </h1>

          <p className="text-neutral-400 text-base md:text-lg leading-relaxed mb-8 max-w-lg mx-auto">
            {t("downloadPage.subtitle")}
          </p>

          <AppStoreBadges className="justify-center" />
        </motion.div>
      </section>
    </>
  );
}
