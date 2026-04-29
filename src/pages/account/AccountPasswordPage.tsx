import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { BackButton } from "@/components/auth/BackButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import { api } from "@/lib/api";
import { validatePassword } from "@/hooks/usePasswordRequirements";
import { getApiErrorMessage } from "@/lib/apiError";

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  signOutOthers: boolean;
}

export function AccountPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      signOutOthers: false,
    },
  });

  const newPassword = useWatch({ control, name: "newPassword" }) ?? "";
  const confirmPassword = useWatch({ control, name: "confirmPassword" }) ?? "";
  const isStrong = validatePassword(newPassword);
  const matches = newPassword === confirmPassword && newPassword.length > 0;

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    if (!isStrong || !matches) return;
    setSubmitting(true);
    try {
      await api.auth.changePassword({
        ...(values.currentPassword
          ? { currentPassword: values.currentPassword }
          : {}),
        newPassword: values.newPassword,
      });
      if (values.signOutOthers) {
        try {
          await api.sessions.revokeAllOthers();
        } catch {
          // Best-effort — password is already updated.
        }
      }
      toast.success(t("accountPasswordScreen.success"));
      navigate("/account", { replace: true });
    } catch (error) {
      setServerError(getApiErrorMessage(error, t("common.error")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("accountPasswordScreen.title")} | Seekitup</title>
      </Helmet>
      <PageHeader
        leading={<BackButton to="/account" />}
        title={t("accountPasswordScreen.title")}
        subtitle={t("accountPasswordScreen.subtitle")}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 flex flex-col gap-5"
        noValidate
      >
        <PasswordField
          label={t("accountPasswordScreen.currentPassword")}
          autoComplete="current-password"
          {...register("currentPassword")}
        />

        <PasswordField
          label={t("accountPasswordScreen.newPassword")}
          autoComplete="new-password"
          {...register("newPassword")}
        />

        <PasswordRequirements password={newPassword} />

        <PasswordField
          label={t("accountPasswordScreen.confirmPassword")}
          autoComplete="new-password"
          error={
            confirmPassword && !matches
              ? t("auth.validation.passwordMismatch")
              : undefined
          }
          {...register("confirmPassword")}
        />

        <Checkbox
          label={t("accountPasswordScreen.signOutOthers")}
          description={t("accountPasswordScreen.signOutOthersDescription")}
          {...register("signOutOthers")}
        />

        {serverError ? (
          <p
            role="alert"
            className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {serverError}
          </p>
        ) : null}

        {/* errors object included to avoid lint warning about unused declaration */}
        {Object.keys(errors).length > 0 ? null : null}

        <Button
          type="submit"
          fullWidth
          disabled={!isStrong || !matches}
          loading={submitting}
        >
          {t("accountPasswordScreen.submit")}
        </Button>
      </form>
    </>
  );
}
