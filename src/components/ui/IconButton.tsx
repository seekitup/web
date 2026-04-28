import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Visual size in pixels for the round target. Default 36. */
  size?: number;
  /** Visual variant. `glass` adds a translucent backdrop (use over imagery). */
  variant?: "ghost" | "glass" | "primary";
  "aria-label": string;
}

/**
 * Round icon button used for kebabs and header action affordances. Default
 * variant blends with the dark surface; `glass` is for use over images.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { children, size = 36, variant = "ghost", className, type, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={clsx(
          "inline-flex items-center justify-center rounded-full text-text-dim transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer",
          variant === "ghost" && "hover:bg-white/[0.06] hover:text-text",
          variant === "glass" &&
            "bg-black/40 backdrop-blur-md text-white hover:bg-black/55 ring-1 ring-white/10",
          variant === "primary" &&
            "bg-primary text-background hover:brightness-110",
          className,
        )}
        style={{ width: size, height: size }}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
