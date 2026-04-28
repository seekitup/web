import { forwardRef, type InputHTMLAttributes } from "react";
import { TextField } from "@/components/ui/TextField";

interface EmailFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string | undefined;
  helper?: string | undefined;
  error?: string | undefined;
}

export const EmailField = forwardRef<HTMLInputElement, EmailFieldProps>(
  function EmailField({ label, helper, error, autoComplete, ...rest }, ref) {
    return (
      <TextField
        ref={ref}
        type="email"
        inputMode="email"
        autoComplete={autoComplete ?? "email"}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        label={label}
        helper={helper}
        error={error}
        {...rest}
      />
    );
  },
);
