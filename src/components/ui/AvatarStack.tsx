import clsx from "clsx";
import { Avatar, type AvatarUser } from "./Avatar";

interface AvatarStackProps {
  users: AvatarUser[];
  size?: number;
  max?: number;
  /**
   * Tailwind class for the ring color, applied to each stacked avatar so it
   * separates cleanly from the background. Defaults to a background-coloured
   * ring suitable for the dark surface.
   */
  ringClassName?: string;
  className?: string;
}

/**
 * Overlapping cluster of `Avatar`s with a `+N` overflow chip. Mirrors the
 * mobile `AvatarGroup` (default `max={4}`, ~25% overlap, primary-tinted +N).
 */
export function AvatarStack({
  users,
  size = 28,
  max = 4,
  ringClassName = "ring-background",
  className,
}: AvatarStackProps) {
  if (!users.length) return null;

  const visible = users.slice(0, max);
  const overflow = Math.max(0, users.length - max);

  return (
    <div className={clsx("flex items-center", className)}>
      <div className="flex -space-x-2">
        {visible.map((user) => (
          <Avatar
            key={user.id}
            user={user}
            size={size}
            className={clsx("ring-2", ringClassName)}
          />
        ))}
      </div>
      {overflow > 0 ? (
        <div
          className={clsx(
            "ml-1 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-300 text-[11px] font-semibold ring-2",
            ringClassName,
          )}
          style={{
            width: size,
            height: size,
            marginLeft: -size * 0.25,
          }}
          aria-label={`${overflow} more`}
        >
          +{overflow}
        </div>
      ) : null}
    </div>
  );
}
