"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "lucide-react";

function titleize(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** UUIDs, `l001`-style lead ids, `cc-1`/`conv-1` record ids — anything opaque. */
function isIdSegment(segment: string) {
  return (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) ||
    /^[a-z]{1,4}-?\d+$/i.test(segment) ||
    /^\d+$/.test(segment)
  );
}

/** Path-derived breadcrumb. Dynamic id segments render as "Detail", never titleized. */
export function BreadCrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sec">
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const last = i === segments.length - 1;
        const label = isIdSegment(seg) ? "Detail" : titleize(seg);
        return (
          <Fragment key={href}>
            {i > 0 && <ChevronRightIcon className="size-3.5 text-ink-300" />}
            {last ? (
              <span className="font-medium text-ink-700">{label}</span>
            ) : (
              <Link href={href} className="text-ink-500 hover:text-ink-700">
                {label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
