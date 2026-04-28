import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";
import { Avatar } from "@/components/ui/Avatar";
import { api } from "@/lib/api";
import type { CheckUserResponseDto, FileResponseDto } from "@/types/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface EditorInfo {
  email: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  image?: FileResponseDto | null | undefined;
  exists: boolean;
}

export interface EditorManagerHandle {
  /**
   * If the input is empty, resolves with the current editors list. If the
   * input holds a valid email/username, attempts to add it and resolves with
   * the updated list. If invalid (and the input is non-empty), resolves with
   * `null` so the caller aborts their save.
   */
  flushPendingInput: () => Promise<EditorInfo[] | null>;
}

interface EditorManagerProps {
  editors: EditorInfo[];
  onEditorsChange: (editors: EditorInfo[]) => void;
  inputLabel?: string;
  inputPlaceholder?: string;
  sectionLabel?: string;
  disabled?: boolean;
}

export const EditorManager = forwardRef<EditorManagerHandle, EditorManagerProps>(
  function EditorManager(
    {
      editors,
      onEditorsChange,
      inputLabel,
      inputPlaceholder,
      sectionLabel,
      disabled,
    },
    ref,
  ) {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [value, setValue] = useState("");

    const checkUser = useMutation({
      mutationFn: (input: string): Promise<CheckUserResponseDto | null> =>
        api.auth.checkUser(input),
    });

    const resolvedInputLabel = inputLabel ?? t("editorsModal.addEditor");
    const resolvedInputPlaceholder =
      inputPlaceholder ?? t("editorsModal.emailPlaceholder");
    const resolvedSectionLabel = sectionLabel ?? t("editorsModal.sectionLabel");

    const addEditor = useCallback(
      async (rawInput: string): Promise<EditorInfo[] | null> => {
        const trimmed = rawInput.trim();
        if (!trimmed) return editors;
        if (editors.some((e) => e.email === trimmed)) {
          setValue("");
          return editors;
        }
        const isEmail = trimmed.includes("@");
        try {
          const userInfo = await checkUser.mutateAsync(trimmed);
          if (userInfo === null) {
            if (!isEmail) {
              toast.error(
                t("editorsModal.userNotFound", { username: trimmed }),
              );
              setValue("");
              return null;
            }
            const next: EditorInfo[] = [
              ...editors,
              { email: trimmed, exists: false },
            ];
            onEditorsChange(next);
            setValue("");
            return next;
          }
          if (editors.some((e) => e.email === userInfo.email)) {
            toast.error(t("editorsModal.userAlreadyAdded"));
            setValue("");
            return editors;
          }
          const next: EditorInfo[] = [
            ...editors,
            {
              email: userInfo.email,
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
              image: (userInfo.image as FileResponseDto | null | undefined) ?? null,
              exists: true,
            },
          ];
          onEditorsChange(next);
          setValue("");
          return next;
        } catch {
          if (!isEmail) {
            toast.error(t("editorsModal.userNotFound", { username: trimmed }));
            setValue("");
            return null;
          }
          const next: EditorInfo[] = [
            ...editors,
            { email: trimmed, exists: false },
          ];
          onEditorsChange(next);
          setValue("");
          return next;
        }
      },
      [editors, checkUser, onEditorsChange, t],
    );

    useImperativeHandle(
      ref,
      () => ({
        flushPendingInput: async () => {
          const trimmed = value.trim();
          if (!trimmed) return editors;
          if (trimmed.includes("@") && !EMAIL_REGEX.test(trimmed)) {
            toast.error(t("editorsModal.invalidEmail"));
            return null;
          }
          return addEditor(trimmed);
        },
      }),
      [value, editors, addEditor, t],
    );

    const handleAdd = async () => {
      await addEditor(value);
      inputRef.current?.focus();
    };

    const handleRemove = (email: string) => {
      onEditorsChange(editors.filter((e) => e.email !== email));
    };

    const isPending = checkUser.isPending;

    return (
      <div className="flex flex-col gap-3">
        <TextField
          ref={inputRef}
          label={resolvedInputLabel}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={resolvedInputPlaceholder}
          type="text"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          disabled={disabled || isPending}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          rightAccessory={
            isPending ? (
              <Spinner size={16} />
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                disabled={disabled || !value.trim()}
                aria-label={t("editorsModal.addEditor")}
                className="flex h-8 w-8 items-center justify-center rounded-md text-primary hover:bg-primary/10 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            )
          }
        />

        {editors.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-text-dim">
              {resolvedSectionLabel}
            </p>
            <ul className="flex flex-col gap-1.5">
              {editors.map((editor) => (
                <li
                  key={editor.email}
                  className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-surface-light/40 px-3 py-2"
                >
                  {editor.exists && editor.image?.url ? (
                    <Avatar
                      user={{
                        id: 0,
                        username: editor.email,
                        firstName: editor.firstName,
                        lastName: editor.lastName,
                        image: editor.image
                          ? { id: editor.image.id, url: editor.image.url }
                          : null,
                      }}
                      size={32}
                    />
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-700/60 text-text-dim">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    {editor.exists && (editor.firstName || editor.lastName) ? (
                      <p className="truncate text-[14px] text-text">
                        {[editor.firstName, editor.lastName]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                    ) : null}
                    <p className="truncate text-[12px] text-text-dim">
                      {editor.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(editor.email)}
                    aria-label={t("common.delete")}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-text-dim hover:bg-danger/10 hover:text-danger transition-colors"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  },
);
