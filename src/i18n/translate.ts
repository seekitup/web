import i18n from "i18next";
import type { TOptions } from "i18next";
import type { TxKeyPath } from ".";

export function translate(key: TxKeyPath, options?: TOptions): string {
  return i18n.t(key, options);
}
