export function PipelineColumnCount({ count }: { count: number }) {
  return (
    <span className="rounded-pill bg-surface-sunken px-2 py-0.5 text-caption font-semibold tabular-nums text-ink-500">
      {count}
    </span>
  );
}
