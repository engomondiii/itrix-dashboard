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

/** Path-derived breadcrumb. Skips dynamic-id-looking segments' raw display. */
export function BreadCrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sec">
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const last = i === segments.length - 1;
        return (
          <Fragment key={href}>
            {i > 0 && <ChevronRightIcon className="size-3.5 text-ink-300" />}
            {last ? (
              <span className="font-medium text-ink-700">{titleize(seg)}</span>
            ) : (
              <Link href={href} className="text-ink-500 hover:text-ink-700">
                {titleize(seg)}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
