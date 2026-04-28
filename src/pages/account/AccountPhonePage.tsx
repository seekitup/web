import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { BackButton } from "@/components/auth/BackButton";
import { AccountPageHeader } from "@/components/account/SettingsSection";
import { CountryCodePicker } from "@/components/account/CountryCodePicker";
import { COUNTRIES, type Country } from "@/components/account/countries";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateUser } from "@/hooks/useUpdateUser";
import { getApiErrorMessage } from "@/lib/apiError";

export function AccountPhonePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateUser = useUpdateUser();

  const [countryCode, setCountryCode] = useState(() => {
    const dialCode = user?.phoneNumberCountryCode;
    if (dialCode) {
      const match = COUNTRIES.find((c) => c.dialCode === dialCode);
      if (match) return match.code;
    }
    return "US";
  });
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");

  if (!user) return null;

  const selectedCountry =
    COUNTRIES.find((c) => c.code === countryCode) ??
    COUNTRIES.find((c) => c.code === "US")!;
  const isVerified = !!user.phoneNumberVerifiedAt;

  const digitsOnly = phoneNumber.replace(/\D/g, "");
  const phoneError = (() => {
    if (!phoneNumber) return null;
    if (digitsOnly.length < 6) return t("accountPhoneScreen.tooShort");
    if (digitsOnly.length > 15) return t("accountPhoneScreen.tooLong");
    return null;
  })();

  const hasChanges =
    digitsOnly !== (user.phoneNumber ?? "") ||
    selectedCountry.dialCode !== (user.phoneNumberCountryCode ?? "");
  const isValid = digitsOnly.length > 0 && !phoneError;

  const onSelectCountry = (country: Country) => setCountryCode(country.code);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || !isValid) return;
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: {
          phoneNumberCountryCode: selectedCountry.dialCode,
          phoneNumber: digitsOnly,
        },
      });
      toast.success(t("accountPhoneScreen.success"));
      navigate("/account", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("accountScreen.updateFailed")));
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("accountPhoneScreen.title")} | Seekitup</title>
      </Helmet>
      <BackButton to="/account" className="mb-4" />
      <AccountPageHeader
        title={t("accountPhoneScreen.title")}
        subtitle={t("accountPhoneScreen.subtitle")}
      />

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-dim">
            {t("accountPhoneScreen.label")}
          </label>
          <div className="flex items-stretch gap-2">
            <CountryCodePicker
              selectedCode={countryCode}
              onSelect={onSelectCountry}
            />
            <div className="flex-1">
              <TextField
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t("accountPhoneScreen.placeholder")}
                inputMode="tel"
                autoComplete="tel"
                error={phoneError ?? undefined}
              />
            </div>
          </div>
          {phoneNumber && !hasChanges && !phoneError ? (
            <p
              className={`text-xs ${
                isVerified ? "text-primary" : "text-accent"
              }`}
            >
              {isVerified
                ? t("accountPhoneScreen.verified")
                : t("accountPhoneScreen.notVerified")}
            </p>
          ) : null}
        </div>

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
