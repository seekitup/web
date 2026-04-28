interface SearchSkeletonProps {
  count?: number;
}

/** Five compact-row skeletons. Mirrors mobile's CompactLinkSkeleton stack. */
export function SearchSkeleton({ count = 5 }: SearchSkeletonProps) {
  return (
    <ul className="flex flex-col gap-1 px-2">
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="flex items-start gap-3 px-3 py-3"
          aria-hidden="true"
        >
          <span className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-neutral-800/80" />
          <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
            <span
              className="h-3 animate-pulse rounded bg-neutral-800/80"
              style={{ width: `${50 + ((i * 9) % 30)}%` }}
            />
            <span
              className="h-2.5 animate-pulse rounded bg-neutral-800/60"
              style={{ width: `${28 + ((i * 13) % 24)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
