import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { GoogleButton } from "@/components/auth/GoogleButton";

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>{t("loginScreen.title")} | Seekitup</title>
      </Helmet>
      <AuthCard
        title={t("loginScreen.title")}
        subtitle={t("loginScreen.subtitle")}
        footer={
          <span>
            {t("auth.noAccount")}{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              {t("auth.signUp")}
            </Link>
          </span>
        }
      >
        <Button
          variant="primary"
          fullWidth
          onClick={() => navigate("/login/email")}
          leftIcon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          }
        >
          {t("auth.continueWithEmail")}
        </Button>

        <GoogleButton />

        <div className="my-1 flex items-center gap-3">
          <span className="h-px flex-1 bg-neutral-800" />
          <span className="text-xs uppercase tracking-wider text-text-dim">
            {t("auth.or")}
          </span>
          <span className="h-px flex-1 bg-neutral-800" />
        </div>

        <Button
          variant="ghost"
          fullWidth
          onClick={() => navigate("/login/passwordless")}
        >
          {t("auth.useSignInLink")}
        </Button>
      </AuthCard>
    </>
  );
}
