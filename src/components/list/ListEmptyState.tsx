import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface ListEmptyStateProps {
  icon?: ReactNode;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function ListEmptyState({
  icon,
  title,
  subtitle,
  ctaLabel,
  onCta,
}: ListEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center px-6 py-16"
    >
      {icon ? (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-text-dim">
          {icon}
        </div>
      ) : null}
      <h2 className="text-xl font-semibold text-text mb-2">{title}</h2>
      <p className="text-text-dim text-sm max-w-md mb-6 leading-relaxed">
        {subtitle}
      </p>
      {ctaLabel && onCta ? (
        <button
          type="button"
          onClick={onCta}
          className="bg-primary text-background font-semibold px-5 py-2.5 rounded-full hover:bg-primary-dark transition-colors text-sm cursor-pointer"
        >
          {ctaLabel}
        </button>
      ) : null}
    </motion.div>
  );
}
