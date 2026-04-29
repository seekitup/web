import { useTranslation } from "react-i18next";
import { Avatar, type AvatarUser } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { UsersIcon } from "@/components/ui/icons";

interface PendingInvitationBannerProps {
  owner: AvatarUser;
  onAccept: () => void;
  isAccepting: boolean;
}

export function PendingInvitationBanner({
  owner,
  onAccept,
  isAccepting,
}: PendingInvitationBannerProps) {
  const { t } = useTranslation();
  const ownerName = owner.firstName || owner.username;

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-primary/15 bg-neutral-900/80 p-4 transition-colors hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-5"
      style={{
        background:
          "linear-gradient(135deg, rgba(0, 255, 153, 0.06) 0%, rgba(0, 255, 153, 0.02) 100%)",
      }}
      role="region"
      aria-label={t("collectionOptions.sharedBy", { name: ownerName })}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
          <UsersIcon size={18} />
        </span>
        <Avatar user={owner} size={28} />
        <p className="min-w-0 truncate text-sm text-white/80">
          {t("collectionOptions.sharedBy", { name: ownerName })}
        </p>
      </div>

      <Button
        variant="primary"
        size="md"
        loading={isAccepting}
        disabled={isAccepting}
        onClick={onAccept}
        className="w-full sm:w-auto sm:shrink-0"
      >
        {t("collectionOptions.addToShared")}
      </Button>
    </div>
  );
}
