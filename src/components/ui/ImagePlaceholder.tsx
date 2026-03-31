interface ImagePlaceholderProps {
  size?: 'full' | 'compact';
}

export function ImagePlaceholder({ size = 'full' }: ImagePlaceholderProps) {
  const logoSize = size === 'compact' ? 'w-8 h-8' : 'w-16 h-16';

  return (
    <div className="w-full h-full flex items-center justify-center bg-surface-light">
      <img
        src="/logo-square.png"
        alt=""
        className={`${logoSize} object-contain grayscale opacity-40`}
        aria-hidden="true"
      />
    </div>
  );
}
