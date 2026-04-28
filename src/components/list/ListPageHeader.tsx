interface ListPageHeaderProps {
  title: string;
  subtitle?: string | undefined;
  cta?:
    | {
        label: string;
        onClick: () => void;
      }
    | undefined;
}

export function ListPageHeader({ title, subtitle, cta }: ListPageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-text leading-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-[13px] text-text-dim">{subtitle}</p>
        ) : null}
      </div>
      {cta ? (
        <button
          type="button"
          onClick={cta.onClick}
          className="shrink-0 flex items-center gap-1.5 bg-primary text-background font-semibold px-4 py-2 rounded-full hover:bg-primary-dark transition-colors text-sm cursor-pointer"
        >
          <PlusIcon />
          <span>{cta.label}</span>
        </button>
      ) : null}
    </header>
  );
}

function PlusIcon() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
