"use client";

import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends Omit<React.ComponentProps<typeof Input>, "type"> {
  /** Wrapper className (the input itself is padded for the icon). */
  wrapperClassName?: string;
}

/** Text input with a leading search icon. Debounce lives in useSearch. */
export function SearchInput({ className, wrapperClassName, ...props }: SearchInputProps) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-secondary" />
      <Input
        type="search"
        className={cn("pl-8", className)}
        {...props}
      />
    </div>
  );
}
