import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";

export function VerificationCompletePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <>
      <Helmet>
        <title>{t("verificationCompleteScreen.title")} | Seekitup</title>
      </Helmet>
      <AuthCard
        title={t("verificationCompleteScreen.title")}
        subtitle={t("verificationCompleteScreen.subtitle")}
        compact
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.05 }}
          className="mx-auto my-2 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-background">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        </motion.div>

        <Button fullWidth onClick={() => navigate("/account", { replace: true })}>
          {t("verificationCompleteScreen.cta")}
        </Button>
      </AuthCard>
    </>
  );
}
