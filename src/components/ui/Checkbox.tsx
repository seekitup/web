import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  description?: ReactNode;
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { label, description, id, className, containerClassName, ...rest },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <label
        htmlFor={inputId}
        className={clsx(
          "group flex items-start gap-3 cursor-pointer select-none",
          rest.disabled && "cursor-not-allowed opacity-60",
          containerClassName,
        )}
      >
        <span className="relative inline-flex h-5 w-5 shrink-0 mt-0.5">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={clsx("peer absolute inset-0 opacity-0 cursor-inherit", className)}
            {...rest}
          />
          <span
            aria-hidden
            className={clsx(
              "h-5 w-5 rounded-md border border-neutral-600 bg-surface transition-all duration-150",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
              "peer-checked:bg-primary peer-checked:border-primary",
              "group-hover:border-neutral-500 peer-checked:group-hover:border-primary",
            )}
          />
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="pointer-events-none absolute inset-0 m-auto h-3.5 w-3.5 text-background opacity-0 peer-checked:opacity-100 transition-opacity"
          >
            <path
              d="M3 8.5l3 3 7-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {label || description ? (
          <span className="flex flex-col gap-0.5">
            {label ? (
              <span className="text-[14px] text-text leading-snug">{label}</span>
            ) : null}
            {description ? (
              <span className="text-xs text-text-dim leading-snug">
                {description}
              </span>
            ) : null}
          </span>
        ) : null}
      </label>
    );
  },
);
