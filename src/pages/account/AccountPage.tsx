import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/Button";
import { AvatarPicker } from "@/components/account/AvatarPicker";
import {
  SettingsSection,
  SettingsRow,
} from "@/components/account/SettingsSection";
import { LANGUAGES } from "@/components/account/languages";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function AtIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function AccountPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  if (!user) return null;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const isEmailVerified = !!user.emailVerifiedAt;
  const hasPhone = !!user.phoneNumber;
  const isPhoneVerified = !!user.phoneNumberVerifiedAt;
  const phoneDisplay = hasPhone
    ? `${user.phoneNumberCountryCode ?? ""} ${user.phoneNumber}`.trim()
    : t("accountScreen.phoneNotSet");

  const language = LANGUAGES.find((l) => l.code === currentLanguage);
  const languageDisplay = language
    ? `${language.flag} ${language.nativeName}`
    : currentLanguage;

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>{t("accountScreen.title")} | Seekitup</title>
      </Helmet>

      <header className="mb-8 flex flex-col items-center gap-5 text-center md:flex-row md:items-center md:gap-6 md:text-left">
        <AvatarPicker user={user} size={92} />
        <div className="min-w-0 max-w-full">
          {fullName ? (
            <h1 className="text-2xl font-bold text-text">{fullName}</h1>
          ) : (
            <h1 className="text-2xl font-bold text-text">@{user.username}</h1>
          )}
          {fullName ? (
            <p className="text-text-dim">@{user.username}</p>
          ) : null}
          <p className="mt-0.5 break-all text-sm text-text-dim sm:break-normal sm:truncate">
            {user.email}
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-7">
        <SettingsSection title={t("accountScreen.profileSection")}>
          <SettingsRow
            label={t("accountScreen.nameRow")}
            leadingIcon={<UserIcon />}
            value={fullName || undefined}
            hint={fullName ? undefined : t("accountScreen.nameNotSet")}
            to="/account/name"
          />
          <SettingsRow
            label={t("accountScreen.usernameRow")}
            leadingIcon={<AtIcon />}
            value={`@${user.username}`}
            to="/account/username"
          />
          <SettingsRow
            label={t("accountScreen.emailRow")}
            leadingIcon={<MailIcon />}
            value={user.email}
            status={isEmailVerified ? "verified" : "warning"}
            to="/account/email"
          />
          <SettingsRow
            label={t("accountScreen.phoneRow")}
            leadingIcon={<PhoneIcon />}
            value={phoneDisplay}
            status={
              hasPhone ? (isPhoneVerified ? "verified" : "warning") : "neutral"
            }
            to="/account/phone"
          />
        </SettingsSection>

        <SettingsSection title={t("accountScreen.settingsSection")}>
          <SettingsRow
            label={t("accountScreen.languageRow")}
            leadingIcon={<GlobeIcon />}
            value={languageDisplay}
            to="/account/language"
          />
        </SettingsSection>

        <SettingsSection title={t("accountScreen.securitySection")}>
          <SettingsRow
            label={t("accountScreen.passwordRow")}
            leadingIcon={<LockIcon />}
            value={t("accountScreen.passwordSet")}
            to="/account/password"
          />
          <SettingsRow
            label={t("accountScreen.twoStepRow")}
            leadingIcon={<ShieldIcon />}
            comingSoon
            to="/account/two-step"
          />
          <SettingsRow
            label={t("accountScreen.sessionsRow")}
            leadingIcon={<MonitorIcon />}
            to="/account/sessions"
          />
        </SettingsSection>

        <SettingsSection>
          <SettingsRow
            label={t("accountScreen.deleteRow")}
            leadingIcon={<TrashIcon />}
            danger
            to="/account/delete"
          />
        </SettingsSection>

        <div className="pt-2">
          <Button variant="subtle" fullWidth onClick={handleLogout}>
            {t("auth.logOut")}
          </Button>
        </div>
      </div>
    </>
  );
}
