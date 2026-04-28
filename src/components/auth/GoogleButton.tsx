import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

interface GoogleButtonProps {
  label?: string;
  fullWidth?: boolean;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
    <path
      fill="#FFC107"
      d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.71v2.26h2.9c1.7-1.56 2.69-3.86 2.69-6.61z"
    />
    <path
      fill="#FF3D00"
      d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.34A9 9 0 0 0 9 18z"
    />
    <path
      fill="#4CAF50"
      d="M3.95 10.7A5.41 5.41 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.96H.96A8.99 8.99 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.99-2.34z"
    />
    <path
      fill="#1976D2"
      d="M9 3.58c1.32 0 2.5.45 3.43 1.34l2.57-2.57A8.97 8.97 0 0 0 9 0 9 9 0 0 0 .96 4.96l2.99 2.34C4.66 5.17 6.65 3.58 9 3.58z"
    />
  </svg>
);

export function GoogleButton({ label, fullWidth = true }: GoogleButtonProps) {
  const { t } = useTranslation();
  const handleClick = () => {
    const redirectUri = `${window.location.origin}/auth/callback`;
    window.location.assign(api.auth.googleLoginUrl(redirectUri));
  };

  return (
    <Button
      variant="outlined"
      fullWidth={fullWidth}
      onClick={handleClick}
      leftIcon={<GoogleIcon />}
    >
      {label ?? t("auth.continueWithGoogle")}
    </Button>
  );
}
