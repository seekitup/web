import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";
import { Spinner } from "./Spinner";

type Variant = "primary" | "outlined" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const SIZE_CLASS: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-base",
};

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-primary to-primary-light text-background font-semibold shadow-[0_8px_24px_-12px_rgba(0,255,153,0.6)] hover:shadow-[0_8px_28px_-10px_rgba(0,255,153,0.8)] hover:brightness-110 active:brightness-95",
  outlined:
    "border border-neutral-700 text-text bg-transparent hover:border-primary hover:text-primary",
  ghost: "text-text hover:text-primary hover:bg-white/5",
  danger:
    "bg-danger text-white font-semibold hover:opacity-90 active:opacity-80",
  subtle:
    "bg-surface-light text-text hover:bg-neutral-700/60 border border-neutral-800",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "lg",
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    className,
    type = "button",
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={clsx(
        "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
        SIZE_CLASS[size],
        VARIANT_CLASS[variant],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Spinner size={size === "sm" ? 16 : 18} />
      ) : (
        <>
          {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
          <span className="truncate">{children}</span>
          {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
        </>
      )}
    </button>
  );
});
