import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import clsx from "clsx";

export interface OtpInputHandle {
  focus: () => void;
  clear: () => void;
}

interface OtpInputProps {
  length?: number;
  value?: string;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Web OTP input — six visible boxes backed by a single hidden text input
 * so paste from email/SMS distributes cleanly. Uses autoComplete="one-time-code"
 * for iOS/Android SMS autofill.
 */
export const OtpInput = forwardRef<OtpInputHandle, OtpInputProps>(
  function OtpInput(
    {
      length = 6,
      value: controlledValue,
      onChange,
      onComplete,
      disabled = false,
      autoFocus = true,
      className,
    },
    ref,
  ) {
    const [internal, setInternal] = useState("");
    const value = controlledValue ?? internal;
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => {
        setInternal("");
        onChange?.("");
      },
    }));

    useEffect(() => {
      if (autoFocus && !disabled) {
        inputRef.current?.focus();
      }
    }, [autoFocus, disabled]);

    const handleChange = (raw: string) => {
      const next = raw.replace(/\D/g, "").slice(0, length);
      if (controlledValue === undefined) setInternal(next);
      onChange?.(next);
      if (next.length === length) onComplete?.(next);
    };

    return (
      <div
        className={clsx(
          "relative mx-auto flex w-full max-w-[360px] justify-center gap-2",
          className,
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {Array.from({ length }).map((_, idx) => {
          const char = value[idx] ?? "";
          const isFilled = char !== "";
          const isCurrent = isFocused && idx === value.length;
          return (
            <div
              key={idx}
              className={clsx(
                "relative flex h-14 w-12 items-center justify-center rounded-lg border bg-surface transition-colors",
                isFilled || isCurrent
                  ? "border-primary"
                  : "border-neutral-600",
                disabled && "opacity-50",
              )}
            >
              <span className="text-2xl font-medium text-text">{char}</span>
              {isCurrent ? (
                <span className="absolute inset-x-3 bottom-2 h-0.5 animate-pulse rounded-full bg-primary" />
              ) : null}
            </div>
          );
        })}
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={length}
          pattern="\d*"
          disabled={disabled}
          aria-label="Verification code"
          className="absolute inset-0 h-full w-full cursor-default opacity-0"
        />
      </div>
    );
  },
);
