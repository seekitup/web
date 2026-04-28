import { useTranslation } from "react-i18next";
import clsx from "clsx";
import type { CollectionOwnership } from "@/lib/ownership";

interface OwnershipChipProps {
  ownership: CollectionOwnership | "shared";
  className?: string;
}

const LABEL_KEY: Record<OwnershipChipProps["ownership"], string> = {
  own: "ownership.mine",
  collaborative: "ownership.collaborative",
  shared: "ownership.shared",
  saved: "ownership.saved",
};

const TONE: Record<OwnershipChipProps["ownership"], string> = {
  own: "bg-primary/15 text-primary border-primary/30",
  collaborative: "bg-violet-500/15 text-violet-300 border-violet-400/30",
  shared: "bg-violet-500/15 text-violet-300 border-violet-400/30",
  saved: "bg-accent/15 text-accent border-accent/30",
};

export function OwnershipChip({ ownership, className }: OwnershipChipProps) {
  const { t } = useTranslation();
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        TONE[ownership],
        className,
      )}
    >
      {t(LABEL_KEY[ownership])}
    </span>
  );
}
