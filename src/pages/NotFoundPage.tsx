import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { ErrorState } from "@/components/ui/ErrorState";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("notFoundPage.metaTitle")}</title>
      </Helmet>
      <ErrorState
        icon={
          <div className="text-8xl font-bold text-neutral-800 select-none">
            404
          </div>
        }
        title={t("notFoundPage.title")}
        description={t("notFoundPage.description")}
        ctaText={t("notFoundPage.cta")}
        ctaTo="/download"
        ctaDisabled
        ctaLabel={t("common.comingSoon")}
      />
    </>
  );
}
