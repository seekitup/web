import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { BackButton } from "@/components/auth/BackButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { getApiErrorMessage } from "@/lib/apiError";

export function AccountNamePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateUser = useUpdateUser();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");

  if (!user) return null;

  const trimmedFirst = firstName.trim();
  const trimmedLast = lastName.trim();
  const hasChanges =
    trimmedFirst !== (user.firstName ?? "") ||
    trimmedLast !== (user.lastName ?? "");
  const isValid = trimmedFirst.length > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || !isValid) return;
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: {
          firstName: trimmedFirst,
          lastName: trimmedLast,
        },
      });
      toast.success(t("accountNameScreen.success"));
      navigate("/account", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("accountScreen.updateFailed")));
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("accountNameScreen.title")} | Seekitup</title>
      </Helmet>
      <PageHeader
        leading={<BackButton to="/account" />}
        title={t("accountNameScreen.title")}
        subtitle={t("accountNameScreen.subtitle")}
      />

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-5" noValidate>
        <TextField
          label={t("accountNameScreen.firstName")}
          placeholder={t("accountNameScreen.firstNamePlaceholder")}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="given-name"
          autoCapitalize="words"
          autoFocus
        />
        <TextField
          label={t("accountNameScreen.lastName")}
          placeholder={t("accountNameScreen.lastNamePlaceholder")}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete="family-name"
          autoCapitalize="words"
        />

        <Button
          type="submit"
          fullWidth
          disabled={!hasChanges || !isValid}
          loading={updateUser.isPending}
        >
          {t("common.save")}
        </Button>
      </form>
    </>
  );
}
