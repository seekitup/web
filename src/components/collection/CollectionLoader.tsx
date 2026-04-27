interface CollectionLoaderProps {
  className?: string;
}

export function CollectionLoader({ className = "" }: CollectionLoaderProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className="w-7 h-7 animate-spin text-primary"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
