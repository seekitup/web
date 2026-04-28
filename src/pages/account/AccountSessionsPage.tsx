import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { BackButton } from "@/components/auth/BackButton";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/apiError";
import type { SessionResponseDto } from "@/types/api";

function formatRelative(iso: string, locale: string): string {
  try {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (diff < 60) return rtf.format(-Math.floor(diff), "second");
    if (diff < 3600) return rtf.format(-Math.floor(diff / 60), "minute");
    if (diff < 86_400) return rtf.format(-Math.floor(diff / 3600), "hour");
    if (diff < 7 * 86_400) return rtf.format(-Math.floor(diff / 86_400), "day");
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

function deviceIcon(s: SessionResponseDto) {
  if (s.deviceType === "mobile" || s.isMobile) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    );
  }
  if (s.deviceType === "tablet") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

export function AccountSessionsPage() {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const sessionsQuery = useQuery({
    queryKey: ["sessions"],
    queryFn: () => api.sessions.list({ limit: 50 }),
  });

  const revoke = useMutation({
    mutationFn: (id: number) => api.sessions.revoke(id),
    onSuccess: () => {
      toast.success(t("accountSessionsScreen.revoked"));
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, t("common.error"))),
  });

  const revokeOthers = useMutation({
    mutationFn: () => api.sessions.revokeAllOthers(),
    onSuccess: (res) => {
      toast.success(res.message || t("accountSessionsScreen.othersRevoked"));
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, t("common.error"))),
  });

  const sessions = sessionsQuery.data?.data ?? [];

  return (
    <>
      <Helmet>
        <title>{t("accountSessionsScreen.title")} | Seekitup</title>
      </Helmet>
      <BackButton to="/account" className="mb-4" />
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">
            {t("accountSessionsScreen.title")}
          </h1>
          <p className="mt-1 text-text-dim">
            {t("accountSessionsScreen.subtitle")}
          </p>
        </div>
        <button
          onClick={() => sessionsQuery.refetch()}
          className="text-sm text-text-dim hover:text-text transition-colors p-2 -m-2"
          aria-label={t("accountSessionsScreen.refresh")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </header>

      {sessionsQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size={28} className="text-primary" />
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-center text-text-dim py-10">
          {t("accountSessionsScreen.empty")}
        </p>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-neutral-800 bg-surface divide-y divide-neutral-800">
          {sessions.map((s) => {
            const deviceLabel =
              s.deviceName ||
              [s.browserName, s.platform].filter(Boolean).join(" · ") ||
              t("accountSessionsScreen.deviceUnknown");
            const location =
              [s.city, s.region, s.countryIsoCode].filter(Boolean).join(", ") ||
              t("accountSessionsScreen.locationUnknown");
            return (
              <li key={s.id} className="flex items-center gap-3 px-4 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-800/60 text-text-dim">
                  {deviceIcon(s)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">
                    {deviceLabel}
                    {s.isCurrent ? (
                      <span className="ml-2 inline-flex h-5 items-center rounded-full bg-primary/15 px-2 text-[10px] font-bold text-primary">
                        {t("accountSessionsScreen.current")}
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-text-dim">
                    {location} ·{" "}
                    {t("accountSessionsScreen.lastActive", {
                      time: formatRelative(s.updatedAt, i18n.language),
                    })}
                  </p>
                </div>
                {!s.isCurrent ? (
                  confirmingId === s.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="text-xs text-text-dim px-2 py-1 cursor-pointer"
                      >
                        {t("common.cancel")}
                      </button>
                      <button
                        onClick={() => {
                          revoke.mutate(s.id);
                          setConfirmingId(null);
                        }}
                        className="rounded-md bg-danger/15 text-danger px-3 py-1.5 text-xs font-semibold hover:bg-danger/25 transition-colors cursor-pointer"
                      >
                        {t("accountSessionsScreen.revoke")}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingId(s.id)}
                      className="rounded-md text-text-dim hover:text-danger transition-colors px-3 py-1.5 text-xs cursor-pointer"
                    >
                      {t("accountSessionsScreen.revoke")}
                    </button>
                  )
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6">
        <Button
          variant="outlined"
          fullWidth
          loading={revokeOthers.isPending}
          onClick={() => revokeOthers.mutate()}
          disabled={sessions.filter((s) => !s.isCurrent).length === 0}
        >
          {t("accountSessionsScreen.revokeOthers")}
        </Button>
      </div>
    </>
  );
}
