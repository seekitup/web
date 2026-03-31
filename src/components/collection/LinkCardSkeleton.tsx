import { Skeleton } from '@/components/ui/Skeleton';

export function LinkCardSkeleton({ variant = 'list' }: { variant?: 'list' | 'grid' }) {
  if (variant === 'grid') {
    return (
      <div className="flex bg-surface rounded-xl overflow-hidden h-[90px]">
        <Skeleton className="w-[90px] h-[90px] shrink-0 rounded-none" />
        <div className="flex-1 p-3 flex flex-col justify-center gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl overflow-hidden">
      <Skeleton className="w-full aspect-video rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-3.5 h-3.5 rounded" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export function CollectionHeaderSkeleton() {
  return (
    <div className="px-4 pt-6 pb-4 md:pt-10 md:pb-6">
      <Skeleton className="h-8 w-2/3 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex items-center gap-3">
        <Skeleton className="w-7 h-7 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="mt-4 md:mt-6 border-b border-neutral-800" />
    </div>
  );
}
