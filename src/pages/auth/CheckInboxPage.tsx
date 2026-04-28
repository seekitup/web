import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { AuthCard } from "@/components/auth/AuthCard";
import { BackButton } from "@/components/auth/BackButton";
import { Button } from "@/components/ui/Button";

export function CheckInboxPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";

  if (!email) {
    return (
      <AuthCard
        back={<BackButton to="/login" />}
        title={t("checkInboxScreen.title")}
      >
        <Link to="/login" className="text-primary hover:underline">
          {t("auth.backToLogin")}
        </Link>
      </AuthCard>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t("checkInboxScreen.title")} | Seekitup</title>
      </Helmet>
      <AuthCard
        back={<BackButton to="/login/passwordless" />}
        title={t("checkInboxScreen.title")}
        subtitle={
          <Trans
            i18nKey="checkInboxScreen.subtitle"
            values={{ email }}
            components={{ strong: <strong className="text-text font-semibold" /> }}
          />
        }
      >
        <div className="my-4 flex items-center justify-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/15 text-primary">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-background">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </div>
        </div>

        <Button
          fullWidth
          onClick={() =>
            navigate(`/auth/verify?email=${encodeURIComponent(email)}`, {
              state: { email },
            })
          }
        >
          {t("checkInboxScreen.enterCodeManually")}
        </Button>

        <p className="text-center text-xs text-text-dim">
          {t("checkInboxScreen.didntReceive")}
        </p>
      </AuthCard>
    </>
  );
}
