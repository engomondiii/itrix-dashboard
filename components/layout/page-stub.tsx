/**
 * Placeholder body for a destination that exists in the nav but whose screen
 * has not been built out yet. Honest by design: it names what the screen will
 * do, so the shell is never a maze of dead ends during the build-out.
 *
 * Delete each usage as the real screen lands; delete this file with the last.
 */

interface PageStubProps {
  title: string;
  description: string;
  planned: string[];
}

export function PageStub({ title, description, planned }: PageStubProps) {
  return (
    <section>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </header>

      <div className="glass-surface max-w-xl rounded-xl p-6">
        <p className="text-sm font-medium">This screen is being built. It will cover:</p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          {planned.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
