import type { ComponentType, SVGProps } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

interface PlaceholderPageProps {
  titleKey: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/**
 * Bridge page for nav targets whose full implementation hasn't been ported
 * from mobile yet (Home, My Links, Collections). The route + sidebar
 * affordances are live so navigation feels real, while the body explains
 * the feature is on its way.
 */
export function PlaceholderPage({ titleKey, Icon }: PlaceholderPageProps) {
  const { t } = useTranslation();
  const title = t(titleKey);
  return (
    <>
      <Helmet>
        <title>{`${title} | Seekitup`}</title>
      </Helmet>

      <div className="mx-auto flex max-w-xl flex-col items-center pt-10 pb-20 text-center">
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full bg-primary/10 blur-2xl"
          />
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-neutral-800 bg-surface text-primary">
            <Icon width={36} height={36} strokeWidth={1.6} />
          </div>
        </div>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-text">
          {title}
        </h1>
        <p className="mt-3 text-text-dim">{t("common.comingSoon")}</p>
      </div>
    </>
  );
}
