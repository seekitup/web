import i18n from "i18next";
import type { TOptions } from "i18next";
import type { TxKeyPath } from ".";

export function translate(key: TxKeyPath, options?: TOptions): string {
  return options === undefined ? i18n.t(key) : i18n.t(key, options);
}
