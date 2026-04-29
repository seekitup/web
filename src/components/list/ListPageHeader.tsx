import { PageHeader } from "@/components/layout/PageHeader";

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
    <PageHeader
      title={title}
      {...(subtitle !== undefined ? { subtitle } : {})}
      {...(cta ? { cta } : {})}
    />
  );
}
