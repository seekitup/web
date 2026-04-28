import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { BackButton } from "@/components/auth/BackButton";
import { OtpInput, type OtpInputHandle } from "@/components/auth/OtpInput";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/apiError";

type Flow = "login" | "emailVerification";

interface LocationState {
  email?: string;
  flow?: Flow;
}

export function VerifyCodePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { verifyOtp, requestOtp, refreshUser, isAuthenticated } = useAuth();

  const state = (location.state ?? {}) as LocationState;
  const email = state.email ?? params.get("email") ?? "";
  const flow: Flow = state.flow ?? (params.get("flow") as Flow) ?? "login";

  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [pendingPostAuth, setPendingPostAuth] = useState<
    "/signup/success" | "/auth/verified" | null
  >(null);
  const otpRef = useRef<OtpInputHandle>(null);

  // Defer post-auth navigation until isAuthenticated flips (matches mobile).
  useEffect(() => {
    if (isAuthenticated && pendingPostAuth) {
      navigate(pendingPostAuth, { replace: true });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPendingPostAuth(null);
    }
  }, [isAuthenticated, pendingPostAuth, navigate]);

  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const handleComplete = async (code: string) => {
    if (!email) return;
    setIsVerifying(true);
    try {
      const user = await verifyOtp({ email, code });

      if (flow === "emailVerification") {
        await refreshUser();
        toast.success(t("accountScreen.emailVerifiedSuccess"));
        navigate("/account/email", { replace: true });
        return;
      }

      const isNew = Date.now() - new Date(user.createdAt).getTime() < 120_000;
      setPendingPostAuth(isNew ? "/signup/success" : "/auth/verified");
    } catch (error) {
      toast.error(t("verifyCodeScreen.verificationFailed"), {
        description: getApiErrorMessage(error, t("verifyCodeScreen.invalidCode")),
      });
      otpRef.current?.clear();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isResending || !email) return;
    setIsResending(true);
    try {
      await requestOtp({ email });
      setResendTimer(30);
      toast.success(t("verifyCodeScreen.codeSent"));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("verifyCodeScreen.resendFailed")));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("verifyCodeScreen.title")} | Seekitup</title>
      </Helmet>
      <AuthCard
        back={<BackButton />}
        title={t("verifyCodeScreen.title")}
        subtitle={
          email ? (
            <Trans
              i18nKey="verifyCodeScreen.subtitle"
              values={{ email }}
              components={{ strong: <strong className="text-text font-semibold" /> }}
            />
          ) : null
        }
      >
        <div className="flex flex-col items-center gap-4">
          {isVerifying ? (
            <div className="flex h-14 items-center justify-center text-primary">
              <Spinner size={28} />
            </div>
          ) : (
            <OtpInput
              ref={otpRef}
              length={6}
              onComplete={handleComplete}
              disabled={isVerifying}
            />
          )}

          <button
            type="button"
            onClick={() =>
              toast.info(t("verifyCodeScreen.help"), {
                description: t("verifyCodeScreen.helpMessage"),
              })
            }
            className="text-sm text-primary hover:underline"
          >
            {t("verifyCodeScreen.needHelp")}
          </button>
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-sm text-text">{t("verifyCodeScreen.didntGetCode")}</p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendTimer > 0 || isResending}
            className="inline-flex items-center gap-2 text-sm text-primary disabled:text-text-dim disabled:cursor-not-allowed hover:underline disabled:no-underline"
          >
            {isResending ? <Spinner size={14} /> : null}
            {resendTimer > 0
              ? t("verifyCodeScreen.getNewOneWithTimer", { seconds: resendTimer })
              : t("verifyCodeScreen.getNewOne")}
          </button>
        </div>
      </AuthCard>
    </>
  );
}
