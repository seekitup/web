import { useEffect, useState, type ReactNode } from "react";
import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";

const SCROLL_THRESHOLD = 8;
const EASING = [0.22, 1, 0.36, 1] as const;
const TRANSFORM_DURATION = 0.25;

export interface PageHeaderCta {
  label: string;
  onClick: () => void;
  /** Defaults to a "+" icon. Pass a node to override, or `null` to suppress. */
  icon?: ReactNode | null;
  type?: "button" | "submit";
  disabled?: boolean;
}

export interface PageHeaderProps {
  title: string;
  /** Collapses to height 0 + opacity 0 when scrolled. */
  subtitle?: string | undefined;
  /** Convenience pill button on the right. Mirrors the previous ListPageHeader API. */
  cta?: PageHeaderCta | undefined;
  /** Custom right-rail node. Wins over `cta` when both are provided. */
  actions?: ReactNode | undefined;
  /** Above-title slot (e.g. BackButton). Stays visible while sticky. */
  leading?: ReactNode | undefined;
  /** Left-of-title slot (e.g. avatar). Scales with the title. */
  adornment?: ReactNode | undefined;
  /** Colors the h1. "danger" is used by /account/delete. */
  tone?: "default" | "danger";
  id?: string | undefined;
  className?: string | undefined;
}

export function PageHeader({
  title,
  subtitle,
  cta,
  actions,
  leading,
  adornment,
  tone = "default",
  id,
  className,
}: PageHeaderProps) {
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transformTransition = reduceMotion
    ? { duration: 0 }
    : { duration: TRANSFORM_DURATION, ease: EASING };

  const right = actions ?? (cta ? <PageHeaderCtaButton cta={cta} /> : null);

  return (
    <motion.header
      id={id}
      // Negative horizontal margins cancel the OutletContainer's px-4 sm:px-6
      // so the border-bottom reaches the container edges, mirroring the navbar.
      // The padding is re-added so inner content stays aligned with the page.
      className={clsx(
        "sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6",
        "transition-[background-color,border-color,box-shadow,backdrop-filter] duration-200",
        scrolled
          ? "border-b border-neutral-800/80 bg-background/80 backdrop-blur-xl shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]"
          : "border-b border-transparent bg-transparent",
        className,
      )}
      animate={{
        paddingTop: scrolled ? 10 : 0,
        paddingBottom: scrolled ? 10 : 0,
      }}
      transition={transformTransition}
    >
      {leading ? (
        <motion.div
          className="origin-left overflow-hidden"
          style={{ transformOrigin: "left center" }}
          animate={{
            scale: scrolled ? 0.92 : 1,
            height: scrolled ? 0 : "auto",
            marginBottom: scrolled ? 0 : 8,
            opacity: scrolled ? 0 : 1,
          }}
          transition={transformTransition}
        >
          {leading}
        </motion.div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <motion.div
          className="flex min-w-0 items-center gap-4"
          style={{ transformOrigin: "left center" }}
          animate={{ scale: scrolled ? 0.84 : 1 }}
          transition={transformTransition}
        >
          {adornment ? (
            <motion.div
              className="shrink-0"
              style={{ transformOrigin: "top left" }}
              animate={{
                // Collapse layout box and visual size together so the avatar
                // takes only the space it occupies post-scale. No overflow:hidden
                // — the avatar has glow/badge/ring decorations that extend beyond
                // its nominal size and must remain visible.
                scale: scrolled ? 0.625 : 1,
                width: scrolled ? 40 : 64,
                height: scrolled ? 40 : 64,
              }}
              transition={transformTransition}
            >
              {adornment}
            </motion.div>
          ) : null}

          <div className="min-w-0">
            <h1
              className={clsx(
                "text-2xl font-semibold leading-tight truncate",
                tone === "danger" ? "text-danger" : "text-text",
              )}
            >
              {title}
            </h1>
            {subtitle ? (
              <motion.p
                className="overflow-hidden text-[13px] text-text-dim truncate"
                animate={{
                  opacity: scrolled ? 0 : 1,
                  height: scrolled ? 0 : "auto",
                  marginTop: scrolled ? 0 : 4,
                }}
                transition={transformTransition}
              >
                {subtitle}
              </motion.p>
            ) : null}
          </div>
        </motion.div>

        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </motion.header>
  );
}

function PageHeaderCtaButton({ cta }: { cta: PageHeaderCta }) {
  const icon = cta.icon === undefined ? <PlusIcon /> : cta.icon;
  return (
    <button
      type={cta.type ?? "button"}
      onClick={cta.onClick}
      disabled={cta.disabled}
      className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {icon}
      <span>{cta.label}</span>
    </button>
  );
}

function PlusIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
