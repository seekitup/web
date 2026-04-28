import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supportedLanguages, type SupportedLanguage } from "@/i18n";
import { useAuth } from "./useAuth";
import { useUpdateUser } from "./useUpdateUser";

export { supportedLanguages, type SupportedLanguage };

function isSupported(code: string): code is SupportedLanguage {
  return (supportedLanguages as readonly string[]).includes(code);
}

function detect(): SupportedLanguage {
  if (typeof window === "undefined") return "es";
  const stored = window.localStorage.getItem("seekitup-language");
  if (stored && isSupported(stored)) return stored;
  const nav = window.navigator.language?.split("-")[0];
  if (nav && isSupported(nav)) return nav;
  return "es";
}

/**
 * Web port of mobile's useLanguage. Manages the active language and persists
 * the preference to the user's profile when authenticated.
 */
export function useLanguage() {
  const { i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const updateUserMutation = useUpdateUser();

  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    () => {
      const fromI18n = i18n.language?.split("-")[0];
      if (fromI18n && isSupported(fromI18n)) return fromI18n;
      return detect();
    },
  );
  const [isChanging, setIsChanging] = useState(false);

  // Sync to user's preference on login.
  useEffect(() => {
    if (
      user?.languageCode &&
      isSupported(user.languageCode) &&
      user.languageCode !== currentLanguage
    ) {
      // i18n.changeLanguage emits "languageChanged"; the listener effect below
      // mirrors it back into local state.
      i18n.changeLanguage(user.languageCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.languageCode, isAuthenticated]);

  // Listen to external i18n changes.
  useEffect(() => {
    const handler = (lng: string) => {
      const code = lng.split("-")[0];
      if (code && isSupported(code)) {
        setCurrentLanguage(code);
      }
    };
    i18n.on("languageChanged", handler);
    return () => i18n.off("languageChanged", handler);
  }, [i18n]);

  const changeLanguage = useCallback(
    async (lang: SupportedLanguage): Promise<boolean> => {
      if (!isSupported(lang)) return false;
      if (lang === currentLanguage) return true;

      setIsChanging(true);
      try {
        await i18n.changeLanguage(lang);
        setCurrentLanguage(lang);

        if (isAuthenticated && user) {
          try {
            await updateUserMutation.mutateAsync({
              id: user.id,
              data: { languageCode: lang },
            });
          } catch {
            // Local change still applied even if persisting fails.
          }
        }
        return true;
      } finally {
        setIsChanging(false);
      }
    },
    [currentLanguage, i18n, isAuthenticated, user, updateUserMutation],
  );

  return {
    currentLanguage,
    isChanging,
    changeLanguage,
    supportedLanguages,
  };
}
