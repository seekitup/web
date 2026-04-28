import { useTranslation } from "react-i18next";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { PlusIcon } from "@/components/layout/nav/icons";
import { useCreateModal } from "./createModalContext";

export function DesktopCreateFab() {
  const { t } = useTranslation();
  const { open, isOpen } = useCreateModal();
  const reduceMotion = useReducedMotion();

  const motionProps: HTMLMotionProps<"button"> = reduceMotion
    ? {}
    : {
        whileHover: { scale: 1.06, rotate: 90 },
        whileTap: { scale: 0.94 },
        transition: { type: "spring", stiffness: 280, damping: 18 },
      };

  return (
    <motion.button
      type="button"
      onClick={() => open({ mode: "creating", tab: "collection" })}
      aria-label={t("createModal.openLabel")}
      aria-hidden={isOpen}
      tabIndex={isOpen ? -1 : 0}
      className="hidden lg:flex fixed bottom-8 right-8 z-30 h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-light text-background shadow-[0_12px_28px_-6px_rgba(0,255,153,0.55)] transition-shadow duration-200 hover:shadow-[0_18px_36px_-4px_rgba(0,255,153,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      {...motionProps}
    >
      <PlusIcon width={24} height={24} strokeWidth={2.6} />
    </motion.button>
  );
}
