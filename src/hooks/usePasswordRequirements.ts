import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface PasswordRequirement {
  id: string;
  label: string;
  isMet: boolean;
}

interface PasswordRule {
  id: "length" | "uppercase" | "number";
  validate: (password: string) => boolean;
}

const RULES: PasswordRule[] = [
  { id: "length", validate: (p) => p.length >= 10 },
  { id: "uppercase", validate: (p) => /[A-Z]/.test(p) },
  { id: "number", validate: (p) => /[0-9]/.test(p) },
];

export function usePasswordRequirements(password: string): PasswordRequirement[] {
  const { t } = useTranslation();
  return useMemo(
    () =>
      RULES.map((rule) => ({
        id: rule.id,
        label: t(`passwordReq.${rule.id}`),
        isMet: rule.validate(password),
      })),
    [password, t],
  );
}

export function validatePassword(password: string): boolean {
  return RULES.every((r) => r.validate(password));
}
