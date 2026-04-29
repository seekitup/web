import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/auth/BackButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/apiError";

export function AccountEmailPage() {
  const { t, i18n } = useTranslation();
  const { user, requestOtp } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;
  const isVerified = !!user.emailVerifiedAt;

  const handleSendCode = async () => {
    setSubmitting(true);
    try {
      // Use OTP request which creates/sends a 6-digit code we can verify in /auth/verify.
      await requestOtp({
        email: user.email,
        languageCode: i18n.language?.split("-")[0] ?? "es",
      });
      toast.success(t("verifyCodeScreen.codeSent"));
      navigate("/auth/verify", {
        state: { email: user.email, flow: "emailVerification" },
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("common.error")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("accountEmailScreen.title")} | Seekitup</title>
      </Helmet>
      <PageHeader
        leading={<BackButton to="/account" />}
        title={t("accountEmailScreen.title")}
        subtitle={t("accountEmailScreen.subtitle")}
      />

      <div className="mt-6 rounded-2xl border border-neutral-800 bg-surface p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-text-dim">
              {t("accountScreen.emailRow")}
            </p>
            <p className="mt-0.5 truncate text-base font-medium text-text">
              {user.email}
            </p>
          </div>
          <span
            className={`inline-flex h-6 shrink-0 items-center rounded-full px-2 text-[11px] font-semibold ${
              isVerified
                ? "bg-primary/15 text-primary"
                : "bg-accent/15 text-accent"
            }`}
          >
            {isVerified
              ? t("accountEmailScreen.verifiedBadge")
              : t("accountEmailScreen.unverifiedBadge")}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-text-dim">
          {isVerified
            ? t("accountEmailScreen.verifiedDescription")
            : t("accountEmailScreen.unverifiedDescription")}
        </p>
      </div>

      {!isVerified ? (
        <div className="mt-6">
          <Button fullWidth loading={submitting} onClick={handleSendCode}>
            {t("accountEmailScreen.sendCode")}
          </Button>
        </div>
      ) : null}
    </>
  );
}
