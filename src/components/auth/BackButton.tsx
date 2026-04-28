import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export function BackButton({ to, label, className }: BackButtonProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const handleClick = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 text-sm text-text-dim hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md px-1 py-1 ${className ?? ""}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      <span>{label ?? t("common.back")}</span>
    </button>
  );
}
