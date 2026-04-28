import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { AuthCard } from "@/components/auth/AuthCard";
import { BackButton } from "@/components/auth/BackButton";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/apiError";

interface LocationState {
  email?: string;
  password?: string;
}

const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

export function SignUpUsernamePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const { register: doRegister } = useAuth();

  const email = state?.email;
  const password = state?.password;

  const [username, setUsername] = useState("");
  const [debounced, setDebounced] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!email || !password) {
      navigate("/signup/email", { replace: true });
    }
  }, [email, password, navigate]);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(username.trim().toLowerCase()), 400);
    return () => clearTimeout(id);
  }, [username]);

  const formatValid = useMemo(() => {
    return debounced.length >= 3 && USERNAME_RE.test(debounced);
  }, [debounced]);

  const { data: availability, isFetching } = useQuery({
    queryKey: ["check-username", debounced],
    queryFn: () => api.users.checkUsername(debounced),
    enabled: formatValid,
    staleTime: 60_000,
  });

  const isAvailable = availability?.available === true;
  const isTaken = availability?.available === false;

  if (!email || !password) {
    return <Navigate to="/signup/email" replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formatValid || !isAvailable || submitting) return;
    setServerError(null);
    setSubmitting(true);
    try {
      await doRegister({
        email,
        password,
        username: debounced,
        languageCode: i18n.language?.split("-")[0] ?? "es",
      });
      navigate("/signup/success", { replace: true });
    } catch (error) {
      setServerError(getApiErrorMessage(error, t("common.error")));
    } finally {
      setSubmitting(false);
    }
  };

  let helper: string | undefined;
  let errorMsg: string | undefined;
  let accessory: React.ReactNode = null;

  if (username.length === 0) {
    helper = undefined;
  } else if (username.length < 3) {
    errorMsg = t("auth.validation.usernameTooShort");
  } else if (!USERNAME_RE.test(username)) {
    errorMsg = t("auth.validation.usernameInvalid");
  } else if (isFetching || username !== debounced) {
    helper = t("signUpScreen.usernameChecking");
    accessory = <Spinner size={16} className="text-text-dim" />;
  } else if (isTaken) {
    errorMsg = t("signUpScreen.usernameTaken");
    accessory = (
      <span className="text-danger" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </span>
    );
  } else if (isAvailable) {
    helper = t("signUpScreen.usernameAvailable");
    accessory = (
      <span className="text-primary" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t("signUpScreen.usernameTitle")} | Seekitup</title>
      </Helmet>
      <AuthCard
        back={<BackButton />}
        title={t("signUpScreen.usernameTitle")}
        subtitle={t("signUpScreen.usernameSubtitle")}
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <TextField
            label={t("signUpScreen.usernameLabel")}
            placeholder="yourusername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            helper={helper}
            error={errorMsg}
            rightAccessory={accessory}
            leftAccessory={<span className="text-text-dim">@</span>}
          />

          <p className="text-xs leading-relaxed text-text-dim">
            By continuing, you agree to our{" "}
            <a
              href="https://seekitup.com/terms"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="https://seekitup.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Privacy Policy
            </a>
            .
          </p>

          {serverError ? (
            <p
              role="alert"
              className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {serverError}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={!formatValid || !isAvailable}
            loading={submitting}
            fullWidth
          >
            {t("signUpScreen.createAccount")}
          </Button>
        </form>
      </AuthCard>
    </>
  );
}
