import { forwardRef, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label?: string;
  helper?: string;
  /** When true, wraps label/helper + toggle in a subtle card. */
  card?: boolean;
  containerClassName?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    checked,
    onCheckedChange,
    label,
    helper,
    card = false,
    containerClassName,
    className,
    disabled,
    id,
    ...rest
  },
  ref,
) {
  const toggle = () => {
    if (disabled) return;
    onCheckedChange(!checked);
  };

  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-3 transition-colors",
        card && "rounded-xl border border-neutral-800 bg-surface-light/30 px-4 py-3",
        card && checked && "border-primary/40 bg-primary/[0.04]",
        containerClassName,
      )}
    >
      {label || helper ? (
        <div className="flex min-w-0 flex-col gap-0.5">
          {label ? (
            <label
              htmlFor={id}
              className="text-[15px] font-medium text-text"
            >
              {label}
            </label>
          ) : null}
          {helper ? (
            <p className="text-xs text-text-dim leading-snug">{helper}</p>
          ) : null}
        </div>
      ) : null}
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={toggle}
        disabled={disabled}
        className={clsx(
          "relative inline-flex h-[26px] w-[46px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 outline-none",
          "focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          checked ? "bg-primary" : "bg-neutral-700",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        {...rest}
      >
        <span
          aria-hidden
          className={clsx(
            "inline-block h-[20px] w-[20px] rounded-full bg-background shadow-sm transform transition-transform duration-200",
            checked ? "translate-x-[23px]" : "translate-x-[3px]",
          )}
        />
      </button>
    </div>
  );
});
