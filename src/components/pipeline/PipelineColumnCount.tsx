export function PipelineColumnCount({ count }: { count: number }) {
  return (
    <span className="rounded-pill bg-soft px-2 py-0.5 text-caption font-semibold tabular-nums text-ink-secondary">
      {count}
    </span>
  );
}
