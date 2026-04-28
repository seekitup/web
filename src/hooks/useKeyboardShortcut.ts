import { useEffect } from "react";

interface ShortcutCombo {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
}

/**
 * Binds a keyboard shortcut. Skips firing while the user is typing into a
 * different input or a contenteditable element, and while a modal dialog is
 * open. Pass `combos` as an array to register e.g. Cmd+K and Ctrl+K together.
 */
export function useKeyboardShortcut(
  combos: ShortcutCombo | ShortcutCombo[],
  handler: (e: KeyboardEvent) => void,
  { allowFromInput = false }: { allowFromInput?: boolean } = {},
): void {
  useEffect(() => {
    const list = Array.isArray(combos) ? combos : [combos];

    const onKeyDown = (e: KeyboardEvent) => {
      const matched = list.some(
        (c) =>
          c.key.toLowerCase() === e.key.toLowerCase() &&
          (c.meta === undefined ? true : e.metaKey === c.meta) &&
          (c.ctrl === undefined ? true : e.ctrlKey === c.ctrl) &&
          (c.shift === undefined ? true : e.shiftKey === c.shift),
      );
      if (!matched) return;

      const target = e.target as HTMLElement | null;
      if (!allowFromInput && target) {
        const isInput =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;
        if (isInput) return;
      }

      // Don't fire while a modal dialog is open.
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;

      handler(e);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [combos, handler, allowFromInput]);
}
