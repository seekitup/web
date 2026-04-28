import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";
import { BackButton } from "@/components/auth/BackButton";
import { AccountPageHeader } from "@/components/account/SettingsSection";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { getApiErrorMessage } from "@/lib/apiError";

const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

export function AccountUsernamePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateUser = useUpdateUser();

  const [username, setUsername] = useState(user?.username ?? "");
  const [debounced, setDebounced] = useState(user?.username ?? "");

  useEffect(() => {
    const id = window.setTimeout(
      () => setDebounced(username.trim().toLowerCase()),
      400,
    );
    return () => window.clearTimeout(id);
  }, [username]);

  const hasChanges = useMemo(
    () => debounced !== (user?.username ?? "").toLowerCase(),
    [debounced, user?.username],
  );

  const formatValid = useMemo(
    () => debounced.length >= 3 && USERNAME_RE.test(debounced),
    [debounced],
  );
  const shouldCheck = hasChanges && formatValid;

  const { data: availability, isFetching } = useQuery({
    queryKey: ["check-username", debounced],
    queryFn: () => api.users.checkUsername(debounced),
    enabled: shouldCheck,
    staleTime: 30_000,
  });

  if (!user) return null;

  const isAvailable = shouldCheck && availability?.available === true;
  const isTaken = shouldCheck && availability?.available === false;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || !formatValid || !isAvailable || isFetching) return;
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: { username: debounced },
      });
      toast.success(t("accountUsernameScreen.success"));
      navigate("/account", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("accountScreen.updateFailed")));
    }
  };

  let helper: string | undefined;
  let errorMsg: string | undefined;
  let accessory: React.ReactNode = null;

  if (username.length === 0) {
    // empty
  } else if (username.length < 3) {
    errorMsg = t("auth.validation.usernameTooShort");
  } else if (!USERNAME_RE.test(username)) {
    errorMsg = t("auth.validation.usernameInvalid");
  } else if (!hasChanges) {
    // unchanged — neutral
  } else if (isFetching || username.toLowerCase() !== debounced) {
    helper = t("accountUsernameScreen.checking");
    accessory = <Spinner size={16} className="text-text-dim" />;
  } else if (isTaken) {
    errorMsg = t("accountUsernameScreen.taken");
    accessory = (
      <span className="text-danger" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </span>
    );
  } else if (isAvailable) {
    helper = t("accountUsernameScreen.available");
    accessory = (
      <span className="text-primary" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }

  const submitDisabled =
    !hasChanges ||
    !formatValid ||
    !isAvailable ||
    isFetching ||
    updateUser.isPending;

  return (
    <>
      <Helmet>
        <title>{t("accountUsernameScreen.title")} | Seekitup</title>
      </Helmet>
      <BackButton to="/account" className="mb-4" />
      <AccountPageHeader
        title={t("accountUsernameScreen.title")}
        subtitle={t("accountUsernameScreen.subtitle")}
      />

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <TextField
          label={t("accountUsernameScreen.label")}
          placeholder={t("accountUsernameScreen.placeholder")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          leftAccessory={<span className="text-text-dim">@</span>}
          rightAccessory={accessory}
          helper={helper}
          error={errorMsg}
        />

        <Button
          type="submit"
          fullWidth
          disabled={submitDisabled}
          loading={updateUser.isPending}
        >
          {t("common.save")}
        </Button>
      </form>
    </>
  );
}
