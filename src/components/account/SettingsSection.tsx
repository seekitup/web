import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";

interface SettingsSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <section className={clsx("flex flex-col", className)}>
      {title ? (
        <h2 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-dim">
          {title}
        </h2>
      ) : null}
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-surface divide-y divide-white/[0.02]">
        {children}
      </div>
    </section>
  );
}

type Status = "verified" | "warning" | "neutral";

interface SettingsRowProps {
  label: string;
  value?: ReactNode | undefined;
  hint?: string | undefined;
  to?: string | undefined;
  onClick?: (() => void) | undefined;
  status?: Status | undefined;
  comingSoon?: boolean | undefined;
  danger?: boolean | undefined;
  leadingIcon?: ReactNode | undefined;
  trailing?: ReactNode | undefined;
}

function StatusIndicator({ status }: { status: Status }) {
  if (status === "verified") {
    return (
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary"
        aria-hidden
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (status === "warning") {
    return (
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-accent"
        aria-hidden
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </span>
    );
  }
  return null;
}

export function SettingsRow({
  label,
  value,
  hint,
  to,
  onClick,
  status = "neutral",
  comingSoon,
  danger,
  leadingIcon,
  trailing,
}: SettingsRowProps) {
  const interactive = !!(to || onClick) && !comingSoon;

  const inner = (
    <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
      {leadingIcon ? (
        <span
          className={clsx(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            danger
              ? "bg-danger/15 text-danger"
              : "bg-white/[0.04] text-text-dim",
          )}
          aria-hidden
        >
          {leadingIcon}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={clsx(
              "text-[15px] font-medium",
              danger ? "text-danger" : "text-text",
            )}
          >
            {label}
          </p>
          {comingSoon ? (
            <span className="inline-flex h-5 items-center rounded-full bg-white/[0.06] px-2 text-[10px] font-semibold uppercase tracking-wider text-text-dim">
              Soon
            </span>
          ) : null}
        </div>
        {hint ? (
          <p className="mt-0.5 truncate text-xs text-text-dim">{hint}</p>
        ) : null}
      </div>
      <div className="flex min-w-0 items-center gap-2 shrink">
        {value ? (
          <span className="min-w-0 max-w-[40vw] truncate text-sm text-text-dim sm:max-w-[260px]">
            {value}
          </span>
        ) : null}
        {status !== "neutral" ? <StatusIndicator status={status} /> : null}
        {trailing}
        {interactive ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-text-dim/70"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        ) : null}
      </div>
    </div>
  );

  if (comingSoon) {
    return (
      <div className="opacity-70" aria-disabled>
        {inner}
      </div>
    );
  }

  if (to) {
    return (
      <Link
        to={to}
        className="block transition-colors hover:bg-white/[0.03] focus-visible:bg-white/[0.04] focus-visible:outline-none"
      >
        {inner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left transition-colors hover:bg-white/[0.03] focus-visible:bg-white/[0.04] focus-visible:outline-none"
      >
        {inner}
      </button>
    );
  }

  return inner;
}

interface AccountPageHeaderProps {
  title: string;
  subtitle?: string;
}

/** Reusable header for sub-pages with title + subtitle. */
export function AccountPageHeader({ title, subtitle }: AccountPageHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold text-text">{title}</h1>
      {subtitle ? (
        <p className="mt-1 text-text-dim">{subtitle}</p>
      ) : null}
    </header>
  );
}
