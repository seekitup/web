import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { authStorage } from "@/lib/authStorage";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export function OAuthCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  const token = params.get("token");
  const errorParam = params.get("error");

  useEffect(() => {
    // Strict-mode safe: only consume the token once.
    if (ranRef.current) return;
    ranRef.current = true;

    if (errorParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(errorParam);
      return;
    }
    if (!token) {
      setError(t("oauthCallback.failedSubtitle"));
      return;
    }

    (async () => {
      try {
        authStorage.setToken(token);
        const user = await api.auth.getCurrentUser();
        authStorage.setUser(user);
        setUser(user);

        const isNew = Date.now() - new Date(user.createdAt).getTime() < 60_000;
        navigate(isNew ? "/signup/success" : "/account", { replace: true });
      } catch {
        authStorage.clearAuth();
        setError(t("oauthCallback.failedSubtitle"));
      }
    })();
  }, [token, errorParam, navigate, setUser, t]);

  return (
    <>
      <Helmet>
        <title>{t("oauthCallback.signingIn")} | Seekitup</title>
      </Helmet>
      <div className="flex w-full max-w-md flex-col items-center text-center">
        {error ? (
          <div className="rounded-2xl border border-neutral-800 bg-surface/80 backdrop-blur-sm p-8 w-full">
            <h1 className="text-xl font-bold text-text">
              {t("oauthCallback.failed")}
            </h1>
            <p className="mt-2 text-sm text-text-dim">{error}</p>
            <div className="mt-6">
              <Button fullWidth onClick={() => navigate("/login", { replace: true })}>
                {t("oauthCallback.retry")}
              </Button>
            </div>
            <Link
              to="/"
              className="mt-3 inline-block text-sm text-text-dim hover:text-text"
            >
              ← Home
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Spinner size={40} className="text-primary" />
            <p className="text-text-dim">{t("oauthCallback.signingIn")}</p>
          </div>
        )}
      </div>
    </>
  );
}
