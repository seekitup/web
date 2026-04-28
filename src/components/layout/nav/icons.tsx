import type { CSSProperties, SVGProps } from "react";
import clsx from "clsx";

type IconProps = SVGProps<SVGSVGElement>;

const baseProps: IconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/**
 * Renders one of the mobile-app PNG icons (`/public/icons/*.png`) recoloured to
 * the current text color via a CSS mask — same tinting model as the mobile
 * `<Image tintColor>`. Kept under `SVGProps<SVGSVGElement>` so it can stand in
 * anywhere an SVG icon is expected (e.g. `NavItem.Icon`, `PlaceholderPage`).
 */
function MaskedIcon({
  src,
  width = 20,
  height = 20,
  className,
  style,
}: {
  src: string;
  width?: number | string | undefined;
  height?: number | string | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}) {
  const url = `url('${src}')`;
  return (
    <span
      aria-hidden
      className={clsx("inline-block bg-current", className)}
      style={{
        width,
        height,
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        ...style,
      }}
    />
  );
}

function pickSize(props: IconProps): {
  width?: number | string | undefined;
  height?: number | string | undefined;
} {
  const out: { width?: number | string; height?: number | string } = {};
  if (typeof props.width === "number" || typeof props.width === "string") {
    out.width = props.width;
  }
  if (typeof props.height === "number" || typeof props.height === "string") {
    out.height = props.height;
  }
  return out;
}

export function HomeIcon(props: IconProps) {
  return (
    <MaskedIcon
      src="/icons/home.png"
      className={props.className}
      {...pickSize(props)}
    />
  );
}

export function LinksIcon(props: IconProps) {
  return (
    <MaskedIcon
      src="/icons/links.png"
      className={props.className}
      {...pickSize(props)}
    />
  );
}

export function CollectionsIcon(props: IconProps) {
  return (
    <MaskedIcon
      src="/icons/collection.png"
      className={props.className}
      {...pickSize(props)}
    />
  );
}

export function ProfileIcon(props: IconProps) {
  return (
    <MaskedIcon
      src="/icons/account.png"
      className={props.className}
      {...pickSize(props)}
    />
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <MaskedIcon
      src="/icons/plus.png"
      className={props.className}
      {...pickSize(props)}
    />
  );
}

/** No mobile equivalent — kept as SVG so the sidebar search item matches the navbar. */
export function SearchIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/** No mobile equivalent — kept as SVG so the sidebar logout still feels native. */
export function LogoutIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
