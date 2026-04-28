import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { BackButton } from "@/components/auth/BackButton";
import { AccountPageHeader } from "@/components/account/SettingsSection";
import { LanguagePicker } from "@/components/account/LanguagePicker";
import type { Language } from "@/components/account/languages";
import { useLanguage, type SupportedLanguage } from "@/hooks/useLanguage";
import { getApiErrorMessage } from "@/lib/apiError";

export function AccountLanguagePage() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, isChanging } = useLanguage();
  const [pendingCode, setPendingCode] = useState<string | null>(null);

  const onSelect = async (language: Language) => {
    if (language.code === currentLanguage) return;
    setPendingCode(language.code);
    try {
      const ok = await changeLanguage(language.code as SupportedLanguage);
      if (ok) toast.success(t("accountLanguageScreen.success"));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("accountLanguageScreen.failed")));
    } finally {
      setPendingCode(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("accountLanguageScreen.title")} | Seekitup</title>
      </Helmet>
      <BackButton to="/account" className="mb-4" />
      <AccountPageHeader
        title={t("accountLanguageScreen.title")}
        subtitle={t("accountLanguageScreen.subtitle")}
      />

      <LanguagePicker
        selectedCode={currentLanguage}
        onSelect={onSelect}
        isLoading={isChanging}
        changingCode={pendingCode}
      />
    </>
  );
}
