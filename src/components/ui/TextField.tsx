import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import clsx from "clsx";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string | undefined;
  helper?: string | undefined;
  error?: string | undefined;
  rightAccessory?: ReactNode;
  leftAccessory?: ReactNode;
  containerClassName?: string | undefined;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      helper,
      error,
      rightAccessory,
      leftAccessory,
      id,
      className,
      containerClassName,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helperId = helper || error ? `${inputId}-helper` : undefined;
    const hasError = !!error;
    const helperText = error ?? helper;

    return (
      <div className={clsx("flex flex-col gap-1.5", containerClassName)}>
        {label ? (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-dim"
          >
            {label}
          </label>
        ) : null}

        <div
          className={clsx(
            "group relative flex items-center rounded-xl border bg-surface transition-all duration-150",
            hasError
              ? "border-danger focus-within:ring-2 focus-within:ring-danger/30"
              : "border-neutral-700 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25",
          )}
        >
          {leftAccessory ? (
            <span className="pl-3 text-text-dim shrink-0">{leftAccessory}</span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={hasError || undefined}
            aria-describedby={helperId}
            className={clsx(
              "min-w-0 flex-1 bg-transparent px-4 h-12 text-[15px] text-text placeholder:text-text-dim/70 outline-none disabled:opacity-60 disabled:cursor-not-allowed",
              leftAccessory && "pl-2",
              rightAccessory && "pr-2",
              className,
            )}
            {...rest}
          />
          {rightAccessory ? (
            <span className="pr-3 shrink-0">{rightAccessory}</span>
          ) : null}
        </div>

        {helperText ? (
          <p
            id={helperId}
            className={clsx(
              "text-xs leading-snug",
              hasError ? "text-danger" : "text-text-dim",
            )}
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);
