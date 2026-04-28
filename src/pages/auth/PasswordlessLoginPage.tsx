import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { BackButton } from "@/components/auth/BackButton";
import { EmailField } from "@/components/auth/EmailField";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";

const schema = z.object({
  email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;

export function PasswordlessLoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { requestOtp } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await requestOtp({
        email: values.email,
        languageCode: i18n.language?.split("-")[0] ?? "es",
      });
      navigate(
        `/auth/check-inbox?email=${encodeURIComponent(values.email)}`,
        { state: { email: values.email, source: "passwordless" } },
      );
    } catch (error) {
      const status = getApiErrorStatus(error);
      if (status === 429) {
        setServerError(t("loginScreen.rateLimited"));
      } else {
        setServerError(
          getApiErrorMessage(error, t("loginScreen.rateLimited")),
        );
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("loginScreen.passwordlessTitle")} | Seekitup</title>
      </Helmet>
      <AuthCard
        back={<BackButton to="/login" label={t("auth.backToLogin")} />}
        title={t("loginScreen.passwordlessTitle")}
        subtitle={t("loginScreen.passwordlessSubtitle")}
        footer={
          <span>
            {t("auth.noAccount")}{" "}
            <Link
              to="/signup"
              className="font-semibold text-primary hover:underline"
            >
              {t("auth.signUp")}
            </Link>
          </span>
        }
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <EmailField
            label={t("loginScreen.emailLabel")}
            placeholder="you@example.com"
            autoFocus
            error={
              errors.email
                ? t("auth.validation.invalidEmail")
                : undefined
            }
            {...register("email")}
          />

          {serverError ? (
            <p
              role="alert"
              className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {serverError}
            </p>
          ) : null}

          <Button type="submit" loading={isSubmitting} fullWidth>
            {t("loginScreen.sendLink")}
          </Button>
        </form>
      </AuthCard>
    </>
  );
}
