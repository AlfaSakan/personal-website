import type { PropsWithChildren } from "react";
import IconWrapper from "./IconWrapper";

export default function DataItem({
  label,
  value,
  href = "#",
  external = false,
  children,
}: {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
} & PropsWithChildren) {
  return (
    <div className="flex items-center gap-2">
      <IconWrapper>{children}</IconWrapper>
      <div className="text-sm">
        <p className="text-light-gray-70">{label}</p>
        <a
          href={href}
          className="line-clamp-1 text-white-2"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {value}
        </a>
      </div>
    </div>
  );
}
