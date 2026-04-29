import { IconButton } from "@/components/ui/IconButton";
import { MoreIcon } from "@/components/ui/icons";

interface EntityActionKebabProps {
  ariaLabel: string;
  onOpen: () => void;
}

/**
 * Canonical kebab affordance dropped into the `actionSlot` of any
 * link/collection card to open its options modal. Stops propagation so the
 * card's own click handler (navigation / external link) doesn't fire.
 */
export function EntityActionKebab({
  ariaLabel,
  onOpen,
}: EntityActionKebabProps) {
  return (
    <IconButton
      variant="glass"
      size={32}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onOpen();
      }}
    >
      <MoreIcon size={14} />
    </IconButton>
  );
}
