"use client";

import { useState } from "react";
import { MessagesSquareIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useConversations } from "@/hooks/useConsole";
import { useListControls } from "@/hooks/useListControls";
import {
  CONVERSATION_CONTEXTS,
  CONVERSATION_CONTEXT_LABEL,
  type ConversationContext,
  type ConversationSummary,
} from "@/types/conversation";

import { ConversationListItem } from "./ConversationListItem";

type SortKey = "activity" | "approved" | "title";

/** Select options mapped onto {key, dir} sort state. */
const SORT_OPTIONS: Record<string, { key: SortKey; dir: "asc" | "desc"; label: string }> = {
  newest: { key: "activity", dir: "desc", label: "Latest activity" },
  oldest: { key: "activity", dir: "asc", label: "Oldest activity" },
  approved: { key: "approved", dir: "desc", label: "Most approved" },
  title: { key: "title", dir: "asc", label: "Title A–Z" },
};

const SORT_ACCESSORS: Record<SortKey, (c: ConversationSummary) => string | number | null> = {
  activity: (c) => c.lastMessageAt || null,
  approved: (c) => c.unreadCount,
  title: (c) => c.title,
};

export function ConversationList() {
  const { data, isLoading, isError } = useConversations();

  const [context, setContext] = useState<ConversationContext | null>(null);
  const [sortOption, setSortOption] = useState("newest");

  const { search, setSort, pageItems, total, unfilteredTotal, pagination } =
    useListControls<ConversationSummary, SortKey>({
      items: data,
      searchText: (c) => `${c.title} ${c.lastPreview}`,
      sortAccessors: SORT_ACCESSORS,
      initialSort: { key: "activity", dir: "desc" },
      filter: context ? (c) => c.context === context : undefined,
      filterKey: context ?? "all",
    });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-5" />
      </div>
    );
  }
  if (isError) {
    return (
      <EmptyState
        title="Couldn’t load conversations"
        description="The console endpoint isn’t available yet."
      />
    );
  }
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={MessagesSquareIcon}
        title="No conversations"
        description="Client conversations across review, client page, and portal appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search.value}
          onChange={(e) => search.setValue(e.target.value)}
          placeholder="Search title or last message…"
          wrapperClassName="w-full sm:w-72"
        />
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant={context === null ? "default" : "outline"}
            onClick={() => setContext(null)}
          >
            All
          </Button>
          {CONVERSATION_CONTEXTS.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={context === c ? "default" : "outline"}
              onClick={() => setContext(c)}
            >
              {CONVERSATION_CONTEXT_LABEL[c]}
            </Button>
          ))}
        </div>
        <Select
          value={sortOption}
          onValueChange={(v) => {
            const next = SORT_OPTIONS[String(v)];
            if (!next) return;
            setSortOption(String(v));
            setSort({ key: next.key, dir: next.dir });
          }}
        >
          <SelectTrigger size="sm" className="ml-auto">
            <SelectValue>{(v) => `Sort: ${SORT_OPTIONS[String(v)]?.label ?? ""}`}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_OPTIONS).map(([value, opt]) => (
              <SelectItem key={value} value={value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {total === 0 ? (
        <EmptyState
          title="No matches"
          description={`No conversation matches this search or filter (${unfilteredTotal} total).`}
        />
      ) : (
        <>
          <div className="space-y-2">
            {pageItems.map((c) => (
              <ConversationListItem key={c.id} conversation={c} />
            ))}
          </div>
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            onPageChange={pagination.setPage}
            total={total}
            pageSize={pagination.pageSize}
          />
        </>
      )}
    </div>
  );
}
