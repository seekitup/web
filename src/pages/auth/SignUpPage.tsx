import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { GoogleButton } from "@/components/auth/GoogleButton";

export function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <>
      <Helmet>
        <title>{t("signUpScreen.title")} | Seekitup</title>
      </Helmet>
      <AuthCard
        title={t("signUpScreen.title")}
        subtitle={t("signUpScreen.subtitle")}
        footer={
          <span>
            {t("auth.haveAccount")}{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              {t("auth.logIn")}
            </Link>
          </span>
        }
      >
        <Button
          variant="primary"
          fullWidth
          onClick={() => navigate("/signup/email")}
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
      </AuthCard>
    </>
  );
}
