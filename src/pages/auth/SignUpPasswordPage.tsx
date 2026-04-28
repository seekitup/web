import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { AuthCard } from "@/components/auth/AuthCard";
import { BackButton } from "@/components/auth/BackButton";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import { Button } from "@/components/ui/Button";
import { validatePassword } from "@/hooks/usePasswordRequirements";

interface LocationState {
  email?: string;
}

interface FormValues {
  password: string;
}

export function SignUpPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const email = state?.email;

  const { register, handleSubmit, control } = useForm<FormValues>({
    defaultValues: { password: "" },
  });
  const password = useWatch({ control, name: "password" }) ?? "";
  const isValid = validatePassword(password);

  useEffect(() => {
    // If the user lands here without an email in state, send them back to step 1.
    if (!email) {
      navigate("/signup/email", { replace: true });
    }
  }, [email, navigate]);

  if (!email) {
    return <Navigate to="/signup/email" replace />;
  }

  const onSubmit = (values: FormValues) => {
    if (!validatePassword(values.password)) return;
    navigate("/signup/username", {
      state: { email, password: values.password },
    });
  };

  return (
    <>
      <Helmet>
        <title>{t("signUpScreen.passwordTitle")} | Seekitup</title>
      </Helmet>
      <AuthCard
        back={<BackButton />}
        title={t("signUpScreen.passwordTitle")}
        subtitle={t("signUpScreen.passwordSubtitle")}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <PasswordField
            label={t("signUpScreen.passwordLabel")}
            autoComplete="new-password"
            autoFocus
            {...register("password")}
          />

          <PasswordRequirements password={password} className="mt-1" />

          <Button type="submit" disabled={!isValid} fullWidth>
            {t("signUpScreen.nextStep")}
          </Button>
        </form>
      </AuthCard>
    </>
  );
}
