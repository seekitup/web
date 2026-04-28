import { motion } from "framer-motion";
import type { ReactNode } from "react";
import clsx from "clsx";

interface AuthCardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  back?: ReactNode;
  className?: string;
  /** Compact reduces vertical breathing room — use for confirmation-style screens. */
  compact?: boolean;
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  back,
  className,
  compact = false,
}: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        "relative w-full max-w-[420px] rounded-2xl border border-neutral-800 bg-surface/80 backdrop-blur-sm shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)]",
        compact ? "p-6 md:p-7" : "p-7 md:p-9",
        className,
      )}
    >
      {back ? <div className="mb-3">{back}</div> : null}
      {(title || subtitle) && (
        <header className={clsx("flex flex-col gap-2", compact ? "mb-5" : "mb-7")}>
          {title ? (
            <h1 className="text-[26px] font-black leading-tight text-text">
              {title}
            </h1>
          ) : null}
          {subtitle ? (
            <p className="text-[15px] leading-snug text-text-dim">{subtitle}</p>
          ) : null}
        </header>
      )}
      <div className="flex flex-col gap-4">{children}</div>
      {footer ? (
        <footer className="mt-6 border-t border-neutral-800 pt-5 text-sm text-text-dim text-center">
          {footer}
        </footer>
      ) : null}
    </motion.div>
  );
}
