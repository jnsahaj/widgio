import { useMemo, useState } from "react";
import { Archive, ArchiveRestore, Trash2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, groupByDate, relativeTimeShort } from "@/lib/utils";
import { threadHref } from "@/lib/router";
import { useEventStatus } from "@/hooks/use-events";
import type { ThreadSummary } from "@/lib/types";

interface Props {
  threads: ThreadSummary[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onArchive: (id: string, archived: boolean) => void;
  onDelete: (id: string) => void;
}

export function Sidebar({ threads, currentId, onSelect, onArchive, onDelete }: Props) {
  const status = useEventStatus();
  const [showArchived, setShowArchived] = useState(false);

  const visible = useMemo(
    () => threads.filter((t) => (showArchived ? t.archived : !t.archived)),
    [threads, showArchived]
  );

  const groups = useMemo(() => groupByDate(visible), [visible]);
  const total = threads.length;
  const archivedCount = threads.filter((t) => t.archived).length;
  const activeCount = total - archivedCount;

  return (
    <aside className="flex h-full flex-col border-r border-border/60 bg-card/40">
      <header className="flex h-12 items-center justify-between border-b border-border/60 px-4">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          widgio
        </span>
        {status !== "connected" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground">
            <span
              className={cn(
                "h-1 w-1 rounded-full",
                status === "disconnected" ? "bg-destructive" : "bg-muted-foreground"
              )}
            />
            {status === "connecting" ? "connecting" : "offline"}
          </span>
        )}
      </header>

      <div className="scrollbar-thin flex-1 overflow-y-auto py-2">
        {groups.length === 0 ? (
          <EmptyList showArchived={showArchived} />
        ) : (
          groups.map((group) => (
            <section key={group.label} className="mb-2 last:mb-0">
              <div className="px-4 pb-1 pt-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/55">
                {group.label}
              </div>
              <ul>
                {group.items.map((t) => (
                  <ThreadItem
                    key={t.id}
                    thread={t}
                    active={t.id === currentId}
                    onSelect={() => onSelect(t.id)}
                    onArchive={() => onArchive(t.id, !t.archived)}
                    onDelete={() => onDelete(t.id)}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      <footer className="border-t border-border/60 p-1.5">
        <button
          onClick={() => setShowArchived((v) => !v)}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[11.5px] text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
        >
          {showArchived ? <Inbox size={12.5} /> : <Archive size={12.5} />}
          <span className="flex-1">{showArchived ? "Active" : "Archived"}</span>
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
            {showArchived ? activeCount : archivedCount}
          </span>
        </button>
      </footer>
    </aside>
  );
}

function ThreadItem({
  thread,
  active,
  onSelect,
  onArchive,
  onDelete,
}: {
  thread: ThreadSummary;
  active: boolean;
  onSelect: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <li>
      <a
        href={threadHref(thread.id)}
        onClick={(e) => {
          // intercept plain clicks; let cmd/ctrl-click open in new tab natively
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          onSelect();
        }}
        className={cn(
          "group/item relative flex h-7 items-center px-3 mx-1.5 rounded-md text-[12.5px] cursor-default",
          "transition-colors duration-75",
          "hover:bg-secondary/60",
          active && "bg-secondary text-foreground"
        )}
      >
        {thread.inProgress && (
          <span className="absolute left-0 top-1/2 h-3 w-[2px] -translate-y-1/2 rounded-r-full bg-accent" />
        )}
        <span
          className={cn(
            "min-w-0 flex-1 truncate pr-2",
            !active && "text-foreground/85",
            thread.archived && "italic text-muted-foreground"
          )}
        >
          {thread.title || thread.id}
        </span>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground/55 transition-opacity group-hover/item:opacity-0">
          {relativeTimeShort(thread.updatedAt)}
        </span>
        <div className="absolute right-1.5 top-1/2 hidden -translate-y-1/2 gap-0.5 group-hover/item:flex">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onArchive();
            }}
            title={thread.archived ? "Unarchive" : "Archive"}
          >
            {thread.archived ? <ArchiveRestore size={11} /> : <Archive size={11} />}
          </Button>
          <Button
            size="icon-sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (confirm(`Delete "${thread.title || thread.id}"?`)) onDelete();
            }}
            title="Delete"
          >
            <Trash2 size={11} />
          </Button>
        </div>
      </a>
    </li>
  );
}

function EmptyList({ showArchived }: { showArchived: boolean }) {
  return (
    <div className="px-6 py-12 text-center font-mono text-[11px] leading-relaxed text-muted-foreground/55">
      {showArchived ? "Nothing archived." : "No widgets yet."}
    </div>
  );
}
