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
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/apiError";

export function DeleteAccountPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [emailConfirm, setEmailConfirm] = useState("");
  const [wordConfirm, setWordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!user) return null;

  const deleteWord = t("deleteAccountScreen.confirmDeleteWord");
  const canDelete =
    emailConfirm.trim().toLowerCase() === user.email.toLowerCase() &&
    wordConfirm.trim().toUpperCase() === deleteWord;

  const performDelete = async () => {
    setSubmitting(true);
    try {
      await api.auth.deleteAccount();
      await logout();
      toast.success(t("common.success"));
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("common.error")));
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("deleteAccountScreen.title")} | Seekitup</title>
      </Helmet>
      <PageHeader
        leading={<BackButton to="/account" />}
        title={t("deleteAccountScreen.title")}
        subtitle={t("deleteAccountScreen.subtitle")}
        tone="danger"
      />

      <div className="mt-6 rounded-2xl border border-danger/30 bg-danger/5 p-5">
        <ul className="flex flex-col gap-3">
          {[
            t("deleteAccountScreen.warning1"),
            t("deleteAccountScreen.warning2"),
            t("deleteAccountScreen.warning3"),
          ].map((w, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-text">
              <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-danger/20 text-danger">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              {w}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <TextField
          label={t("deleteAccountScreen.confirmEmailLabel")}
          value={emailConfirm}
          onChange={(e) => setEmailConfirm(e.target.value)}
          autoComplete="off"
        />
        <TextField
          label={t("deleteAccountScreen.confirmDeleteLabel")}
          placeholder={deleteWord}
          value={wordConfirm}
          onChange={(e) => setWordConfirm(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="mt-8">
        <Button
          variant="danger"
          fullWidth
          disabled={!canDelete || submitting}
          loading={submitting}
          onClick={() => setShowConfirm(true)}
        >
          {t("deleteAccountScreen.deleteCta")}
        </Button>
      </div>

      {showConfirm ? (
        <div
          role="dialog"
          aria-modal
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfirm(false);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-surface p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-text">
              {t("deleteAccountScreen.finalConfirmTitle")}
            </h2>
            <p className="mt-2 text-sm text-text-dim">
              {t("deleteAccountScreen.finalConfirmBody")}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button
                variant="danger"
                fullWidth
                loading={submitting}
                onClick={performDelete}
              >
                {t("deleteAccountScreen.deleteCta")}
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setShowConfirm(false)}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
