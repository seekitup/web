import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { AuthCard } from "@/components/auth/AuthCard";
import { BackButton } from "@/components/auth/BackButton";
import { EmailField } from "@/components/auth/EmailField";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/apiError";

const schema = z.object({
  email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;

export function SignUpEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [exists, setExists] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

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
    setExists(false);
    setSubmittedEmail(values.email);
    try {
      const found = await api.auth.checkUser(values.email);
      if (found) {
        setExists(true);
        return;
      }
      navigate("/signup/password", { state: { email: values.email } });
    } catch (error) {
      setServerError(getApiErrorMessage(error, t("common.error")));
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("signUpScreen.emailTitle")} | Seekitup</title>
      </Helmet>
      <AuthCard
        back={<BackButton to="/signup" />}
        title={t("signUpScreen.emailTitle")}
        subtitle={t("signUpScreen.emailSubtitle")}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <EmailField
            label={t("signUpScreen.emailLabel")}
            placeholder="you@example.com"
            autoFocus
            error={
              errors.email
                ? t("auth.validation.invalidEmail")
                : undefined
            }
            {...register("email")}
          />

          {exists ? (
            <div
              role="alert"
              className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-3 text-sm"
            >
              <p className="font-medium text-accent">
                {t("signUpScreen.accountExistsTitle")}
              </p>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/login/email?email=${encodeURIComponent(submittedEmail)}`,
                  )
                }
                className="mt-1 inline-flex text-sm font-semibold text-primary hover:underline"
              >
                {t("signUpScreen.accountExistsAction")} →
              </button>
            </div>
          ) : null}

          {serverError ? (
            <p
              role="alert"
              className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {serverError}
            </p>
          ) : null}

          <Button type="submit" loading={isSubmitting} fullWidth>
            {t("signUpScreen.nextStep")}
          </Button>
        </form>
      </AuthCard>
    </>
  );
}
