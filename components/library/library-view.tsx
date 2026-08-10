'use client';

/**
 * Library — two tabs:
 *   Message templates  the wording the team reuses; edit in place. The
 *                      {{variables}} list is server-derived on save.
 *   Buyer profiles     the persona registry. INTERNAL ONLY — the permanent
 *                      banner is a design requirement, not decoration: a
 *                      profile leaking to a customer is a hard failure.
 */

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { normalizeError } from '@/lib/api/errors';
import {
  usePersona,
  usePersonas,
  useSaveTemplate,
  useTemplates,
  type MessageTemplate,
  type TemplateKind,
} from '@/lib/library/api';

const KINDS: Array<{ kind: TemplateKind; label: string }> = [
  { kind: 'email', label: 'Email' },
  { kind: 'follow-up', label: 'Follow-up' },
  { kind: 'evaluation', label: 'Evaluation' },
  { kind: 'poc', label: 'PoC' },
  { kind: 'handoff', label: 'Handoff' },
];

function TemplateCard({ template, kind }: { template: MessageTemplate; kind: TemplateKind }) {
  const { toast } = useToast();
  const save = useSaveTemplate(kind);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(template.name);
  const [body, setBody] = useState(template.body);

  return (
    <article className="glass-surface rounded-xl p-4">
      {editing ? (
        <div className="space-y-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-card px-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full rounded-md border border-input bg-card p-2.5 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={save.isPending || !name.trim() || !body.trim()}
              onClick={() =>
                save.mutate(
                  { id: template.id, name: name.trim(), body },
                  {
                    onSuccess: () => {
                      setEditing(false);
                      toast({ title: 'Template saved', tone: 'success' });
                    },
                    onError: (e) => toast({ title: normalizeError(e).message, tone: 'destructive' }),
                  },
                )
              }
            >
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium">{template.name}</h3>
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              Edit
            </Button>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{template.body}</p>
          {template.variables.length > 0 && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Fills in: {template.variables.map((v) => `{{${v}}}`).join(' · ')}
            </p>
          )}
        </>
      )}
    </article>
  );
}

function TemplatesTab() {
  const [kind, setKind] = useState<TemplateKind>('email');
  const templates = useTemplates(kind);
  const save = useSaveTemplate(kind);
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBody, setNewBody] = useState('');

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {KINDS.map(({ kind: k, label }) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            aria-pressed={kind === k}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium',
              kind === k
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-accent',
            )}
          >
            {label}
          </button>
        ))}
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => setCreating((v) => !v)}>
          {creating ? 'Cancel' : 'New template'}
        </Button>
      </div>

      {creating && (
        <div className="glass-surface mb-3 space-y-2 rounded-xl p-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Template name"
            className="h-8 w-full rounded-md border border-input bg-card px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            rows={5}
            placeholder="Body — use {{variables}} for the parts that change per lead"
            className="w-full rounded-md border border-input bg-card p-2.5 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button
            size="sm"
            disabled={save.isPending || !newName.trim() || !newBody.trim()}
            onClick={() =>
              save.mutate(
                { name: newName.trim(), body: newBody },
                {
                  onSuccess: () => {
                    setCreating(false);
                    setNewName('');
                    setNewBody('');
                    toast({ title: 'Template created', tone: 'success' });
                  },
                  onError: (e) => toast({ title: normalizeError(e).message, tone: 'destructive' }),
                },
              )
            }
          >
            Create
          </Button>
        </div>
      )}

      {templates.isLoading ? (
        <div className="glass-surface animate-pulse rounded-xl p-8 text-sm text-muted-foreground">Loading…</div>
      ) : (templates.data?.results.length ?? 0) === 0 ? (
        <div className="glass-surface rounded-xl p-8 text-center text-sm text-muted-foreground">
          No {kind} templates yet.
        </div>
      ) : (
        <div className="space-y-3">
          {templates.data!.results.map((template) => (
            <TemplateCard key={template.id} template={template} kind={kind} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProfilesTab() {
  const personas = usePersonas();
  const [openId, setOpenId] = useState<string | null>(null);
  const detail = usePersona(openId);

  return (
    <div>
      <p className="mb-4 rounded-lg bg-warning-soft px-3 py-2 text-xs font-medium text-warning">
        Internal only — buyer profiles must never be shared with or shown to customers.
      </p>

      {personas.isLoading ? (
        <div className="glass-surface animate-pulse rounded-xl p-8 text-sm text-muted-foreground">Loading…</div>
      ) : (personas.data?.personas.length ?? 0) === 0 ? (
        <div className="glass-surface rounded-xl p-8 text-center text-sm text-muted-foreground">
          No profiles seeded yet.
        </div>
      ) : (
        <div className="space-y-2">
          {personas.data!.personas.map((persona) => (
            <article key={persona.personaId} className="glass-surface rounded-xl px-4 py-3">
              <button
                type="button"
                onClick={() => setOpenId(openId === persona.personaId ? null : persona.personaId)}
                className="flex w-full flex-wrap items-center gap-2 text-left text-sm"
              >
                <span className="font-medium">{persona.primary_persona || persona.department}</span>
                <span className="text-xs text-muted-foreground">
                  {persona.company} · {persona.functionalFamily} · {persona.pitchArchetype}
                </span>
                <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[11px]">
                  {persona.validationStatus}
                </span>
              </button>
              {openId === persona.personaId && detail.data && (
                <dl className="mt-3 grid gap-x-6 gap-y-1.5 border-t border-border/60 pt-3 text-xs sm:grid-cols-2">
                  {(
                    [
                      ['What they care about', detail.data.primaryKpi],
                      ['Their mandate', detail.data.departmentMandate],
                      ['What sets them off', detail.data.triggerEvent],
                      ['What they want', detail.data.desiredGain],
                      ['Likely champion', detail.data.likelyChampion],
                      ['Likely blocker', detail.data.likelyBlocker],
                      ['Likely objection', detail.data.likelyObjection],
                      ['How to answer it', detail.data.responseAngle],
                    ] as const
                  )
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div key={label}>
                        <dt className="font-medium text-muted-foreground">{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                </dl>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function LibraryView() {
  const [tab, setTab] = useState<'templates' | 'profiles'>('templates');

  return (
    <section>
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display tracking-display text-2xl font-semibold">Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The reference shelf: reusable wording and who we&apos;re selling to.
          </p>
        </div>
        <div className="flex rounded-lg border border-border p-0.5">
          {(
            [
              ['templates', 'Message templates'],
              ['profiles', 'Buyer profiles'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={tab === key}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium',
                tab === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {tab === 'templates' ? <TemplatesTab /> : <ProfilesTab />}
    </section>
  );
}
