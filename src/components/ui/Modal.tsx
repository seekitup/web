import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { useIsDesktop } from "@/hooks/useMediaQuery";

type Variant = "responsive" | "dialog" | "sheet";
type TitleAlign = "left" | "center";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  variant?: Variant;
  /** When false, backdrop click does nothing — useful while a mutation is pending. */
  dismissOnBackdrop?: boolean;
  /** When false, Esc does nothing. */
  dismissOnEscape?: boolean;
  /** Top-right close button. Defaults to true. */
  showClose?: boolean;
  /** Title alignment. Defaults to "center" for a clean modal feel. */
  titleAlign?: TitleAlign;
  /** Optional left-side header slot. Replaces title block when provided. */
  headerLeft?: ReactNode;
  /** Optional below-title slot inside the header (e.g. tabs). */
  headerExtra?: ReactNode;
  /** Stacked layer above another modal. Bumps z-index. */
  stacked?: boolean;
  className?: string;
  children: ReactNode;
}

let openCount = 0;
let savedHtmlOverflow: string | null = null;

function lockBodyScroll() {
  if (typeof document === "undefined") return;
  if (openCount === 0) {
    savedHtmlOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
  }
  openCount += 1;
}

function unlockBodyScroll() {
  if (typeof document === "undefined") return;
  openCount = Math.max(0, openCount - 1);
  if (openCount === 0) {
    document.documentElement.style.overflow = savedHtmlOverflow ?? "";
    savedHtmlOverflow = null;
  }
}

const SHEET_DRAG_THRESHOLD = 120;

export function Modal({
  isOpen,
  onClose,
  title,
  variant = "responsive",
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  showClose = true,
  titleAlign = "center",
  headerLeft,
  headerExtra,
  stacked = false,
  className,
  children,
}: ModalProps) {
  const isDesktop = useIsDesktop();
  const reduceMotion = useReducedMotion();
  const headingId = useId();
  const triggerRef = useRef<Element | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const renderAsSheet =
    variant === "sheet" || (variant === "responsive" && !isDesktop);

  useEffect(() => {
    if (!isOpen) return;
    triggerRef.current = document.activeElement;
    lockBodyScroll();

    const focusTimer = window.setTimeout(() => {
      const node = containerRef.current;
      if (!node) return;
      const focusable = node.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]),button:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      unlockBodyScroll();
      const trigger = triggerRef.current;
      if (trigger instanceof HTMLElement) trigger.focus();
    };
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && dismissOnEscape) {
      e.stopPropagation();
      onClose();
    }
  };

  const handleBackdropClick = () => {
    if (dismissOnBackdrop) onClose();
  };

  const baseZ = stacked ? "z-[60]" : "z-50";

  if (typeof document === "undefined") return null;

  const containerVariants = renderAsSheet
    ? {
        initial: { y: reduceMotion ? 0 : "100%" },
        animate: { y: 0 },
        exit: { y: reduceMotion ? 0 : "100%" },
      }
    : {
        initial: { opacity: 0, scale: reduceMotion ? 1 : 0.96, y: 0 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: reduceMotion ? 1 : 0.97, y: 0 },
      };

  const showHeader = !!(title || headerLeft || showClose);

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div
          className={clsx("fixed inset-0", baseZ)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? headingId : undefined}
          onKeyDown={handleKeyDown}
        >
          <motion.div
            className="absolute inset-0 bg-black/65 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={handleBackdropClick}
          />

          <div
            className={clsx(
              "absolute inset-0 flex pointer-events-none",
              renderAsSheet ? "items-end" : "items-center justify-center p-4",
            )}
          >
            <motion.div
              ref={containerRef}
              className={clsx(
                "relative pointer-events-auto bg-surface text-text flex flex-col overflow-hidden",
                "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.04]",
                renderAsSheet
                  ? "w-full max-h-[90vh] rounded-t-[28px]"
                  : "w-full max-w-[520px] max-h-[88vh] rounded-3xl",
                className,
              )}
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 32,
                mass: 0.8,
              }}
              drag={renderAsSheet && !reduceMotion ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (
                  info.offset.y > SHEET_DRAG_THRESHOLD ||
                  info.velocity.y > 600
                ) {
                  if (dismissOnBackdrop) onClose();
                }
              }}
            >
              {renderAsSheet ? (
                <div className="flex justify-center pt-2.5 pb-1">
                  <span
                    aria-hidden
                    className="h-1 w-10 rounded-full bg-neutral-700"
                  />
                </div>
              ) : null}

              {showHeader ? (
                <div
                  className={clsx(
                    "relative flex items-center gap-3 px-5",
                    renderAsSheet ? "pt-2 pb-3.5" : "pt-5 pb-4",
                  )}
                >
                  {headerLeft ? (
                    <div className="flex-1 min-w-0">{headerLeft}</div>
                  ) : (
                    <div
                      className={clsx(
                        "flex-1 min-w-0",
                        titleAlign === "center" && "text-center",
                      )}
                    >
                      {title ? (
                        <h2
                          id={headingId}
                          className="text-[17px] font-semibold text-text truncate"
                        >
                          {title}
                        </h2>
                      ) : null}
                    </div>
                  )}
                  {showClose ? (
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close"
                      className={clsx(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-dim hover:bg-white/[0.06] hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        titleAlign === "center" && !headerLeft && "absolute right-4 top-1/2 -translate-y-1/2",
                      )}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  ) : null}
                </div>
              ) : null}

              {headerExtra ? <div className="px-5 pb-4">{headerExtra}</div> : null}

              <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
            </motion.div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
