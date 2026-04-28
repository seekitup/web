import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/auth/BackButton";
import { AccountPageHeader } from "@/components/account/SettingsSection";

export function AccountTwoStepPage() {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{t("accountTwoStepScreen.title")} | Seekitup</title>
      </Helmet>
      <BackButton to="/account" className="mb-4" />
      <AccountPageHeader
        title={t("accountTwoStepScreen.title")}
        subtitle={t("accountTwoStepScreen.subtitle")}
      />

      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-surface p-6">
        <div className="flex items-start gap-4">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary"
            aria-hidden
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </span>
          <div>
            <span className="inline-flex h-6 items-center rounded-full bg-white/[0.06] px-2 text-[11px] font-semibold uppercase tracking-wider text-text-dim">
              {t("accountTwoStepScreen.comingSoon")}
            </span>
            <p className="mt-3 text-sm leading-relaxed text-text-dim">
              {t("accountTwoStepScreen.description")}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link to="/account">
          <Button variant="subtle" fullWidth>
            {t("accountTwoStepScreen.backToAccount")}
          </Button>
        </Link>
      </div>
    </>
  );
}
