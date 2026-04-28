import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { BackButton } from "@/components/auth/BackButton";
import { EmailField } from "@/components/auth/EmailField";
import { PasswordField } from "@/components/auth/PasswordField";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { authStorage } from "@/lib/authStorage";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function EmailPasswordLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const remembered = authStorage.getRememberedEmail();
  const initialEmail = searchParams.get("email") ?? remembered ?? "";
  const next = searchParams.get("next") ?? "/account";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: initialEmail,
      password: "",
      rememberMe: !!remembered,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await login({ email: values.email, password: values.password });
      if (values.rememberMe) {
        authStorage.saveRememberedEmail(values.email);
      } else {
        authStorage.clearRememberedEmail();
      }
      navigate(next, { replace: true });
    } catch (error) {
      const status = getApiErrorStatus(error);
      if (status === 401) {
        setServerError(t("loginScreen.invalidCredentials"));
      } else {
        setServerError(
          getApiErrorMessage(error, t("loginScreen.invalidCredentials")),
        );
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("loginScreen.emailTitle")} | Seekitup</title>
      </Helmet>
      <AuthCard
        back={<BackButton to="/login" label={t("auth.backToLogin")} />}
        title={t("loginScreen.emailTitle")}
        subtitle={t("loginScreen.emailSubtitle")}
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
            error={
              errors.email
                ? t("auth.validation.invalidEmail")
                : undefined
            }
            {...register("email")}
          />
          <PasswordField
            label={t("loginScreen.passwordLabel")}
            autoComplete="current-password"
            error={
              errors.password
                ? t("auth.validation.passwordRequired")
                : undefined
            }
            {...register("password")}
          />

          <div className="flex items-center justify-between">
            <Checkbox
              label={t("loginScreen.rememberMe")}
              {...register("rememberMe")}
            />
          </div>

          {serverError ? (
            <p
              role="alert"
              className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {serverError}
            </p>
          ) : null}

          <Button type="submit" loading={isSubmitting} fullWidth>
            {t("loginScreen.signIn")}
          </Button>

          <button
            type="button"
            onClick={() => {
              toast.info(t("loginScreen.passwordlessTitle"), {
                description: t("loginScreen.passwordlessSubtitle"),
              });
              navigate("/login/passwordless");
            }}
            className="self-center text-sm text-primary hover:underline"
          >
            {t("loginScreen.passwordlessLink")}
          </button>
        </form>
      </AuthCard>
    </>
  );
}
