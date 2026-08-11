'use client';

/**
 * Library — two tabs, both entity-style tables with search and client-side
 * pagination (the backend serves each list whole):
 *
 *   Message templates  the wording the team reuses; the editor opens as an
 *                      expandable row. {{variables}} are server-derived.
 *   Buyer profiles     the persona registry. INTERNAL ONLY — the permanent
 *                      banner is a design requirement, not decoration.
 */

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { formatRelative } from '@/lib/entity/format';
import { normalizeError } from '@/lib/api/errors';
import { PaginationFooter, useClientPage } from '@/components/shared/client-pagination';
import {
  usePersona,
  usePersonas,
  useSaveTemplate,
  useTemplates,
  type MessageTemplate,
  type PersonaSummary,
  type TemplateKind,
} from '@/lib/library/api';

const KINDS: Array<{ kind: TemplateKind; label: string }> = [
  { kind: 'email', label: 'Email' },
  { kind: 'follow-up', label: 'Follow-up' },
  { kind: 'evaluation', label: 'Evaluation' },
  { kind: 'poc', label: 'PoC' },
  { kind: 'handoff', label: 'Handoff' },
];

// ---------------------------------------------------------------------------
// Templates tab
// ---------------------------------------------------------------------------

function TemplateEditorRow({
  template,
  kind,
  onClose,
}: {
  template: MessageTemplate;
  kind: TemplateKind;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const save = useSaveTemplate(kind);
  const [name, setName] = useState(template.name);
  const [body, setBody] = useState(template.body);

  return (
    <tr className="border-b border-border/60 bg-muted/30">
      <td colSpan={4} className="px-4 py-3">
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
                      onClose();
                      toast({ title: 'Template saved', tone: 'success' });
                    },
                    onError: (e) => toast({ title: normalizeError(e).message, tone: 'destructive' }),
                  },
                )
              }
            >
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </td>
    </tr>
  );
}

function TemplateRow({
  template,
  kind,
  editing,
  onEdit,
}: {
  template: MessageTemplate;
  kind: TemplateKind;
  editing: boolean;
  onEdit: () => void;
}) {
  return (
    <>
      <tr className="border-b border-border/60 hover:bg-accent/40">
        <td className="px-4 py-2.5">
          <span className="font-medium">{template.name}</span>
          <span className="mt-0.5 block max-w-[48ch] truncate text-xs text-muted-foreground">
            {template.body}
          </span>
        </td>
        <td className="px-4 py-2.5 text-xs text-muted-foreground">
          {template.variables.length > 0
            ? template.variables.map((v) => `{{${v}}}`).join(' ')
            : '—'}
        </td>
        <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatRelative(template.updatedAt)}</td>
        <td className="px-4 py-2.5 text-right">
          <Button size="sm" variant="outline" onClick={onEdit}>
            {editing ? 'Close' : 'Edit'}
          </Button>
        </td>
      </tr>
      {editing && <TemplateEditorRow template={template} kind={kind} onClose={onEdit} />}
    </>
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
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const needle = search.trim().toLowerCase();
  const matching = (templates.data?.results ?? []).filter(
    (t) => !needle || t.name.toLowerCase().includes(needle) || t.body.toLowerCase().includes(needle),
  );
  const pager = useClientPage(matching);

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
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates…"
          className="ml-auto h-8 w-44 rounded-md border border-input bg-card px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button size="sm" variant="outline" onClick={() => setCreating((v) => !v)}>
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
      ) : matching.length === 0 ? (
        <div className="glass-surface rounded-xl p-8 text-center text-sm text-muted-foreground">
          {needle ? 'No templates match the search.' : `No ${kind} templates yet.`}
        </div>
      ) : (
        <>
          <div className="glass-surface overflow-x-auto rounded-xl">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Fills in</th>
                  <th className="px-4 py-2.5 font-medium">Updated</th>
                  <th className="px-4 py-2.5 font-medium" />
                </tr>
              </thead>
              <tbody>
                {pager.pageRows.map((template) => (
                  <TemplateRow
                    key={template.id}
                    template={template}
                    kind={kind}
                    editing={editingId === template.id}
                    onEdit={() => setEditingId(editingId === template.id ? null : template.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <PaginationFooter
            page={pager.page}
            pageSize={pager.pageSize}
            total={pager.total}
            totalPages={pager.totalPages}
            noun="templates"
            onPage={pager.setPage}
            onPageSize={pager.setPageSize}
          />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Buyer profiles tab
// ---------------------------------------------------------------------------

function ProfileDetailRow({ personaId }: { personaId: string }) {
  const detail = usePersona(personaId);
  if (!detail.data) {
    return (
      <tr className="border-b border-border/60 bg-muted/30">
        <td colSpan={6} className="px-4 py-3 text-xs text-muted-foreground">
          Loading…
        </td>
      </tr>
    );
  }
  const d = detail.data;
  const facts: Array<[string, string]> = (
    [
      ['What they care about', d.primaryKpi],
      ['Their mandate', d.departmentMandate],
      ['What sets them off', d.triggerEvent],
      ['What they want', d.desiredGain],
      ['Likely champion', d.likelyChampion],
      ['Likely blocker', d.likelyBlocker],
      ['Likely objection', d.likelyObjection],
      ['How to answer it', d.responseAngle],
    ] as Array<[string, string]>
  ).filter(([, value]) => Boolean(value));

  return (
    <tr className="border-b border-border/60 bg-muted/30">
      <td colSpan={6} className="px-4 py-3">
        <dl className="grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="font-medium text-muted-foreground">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </td>
    </tr>
  );
}

function ProfileRow({
  persona,
  open,
  onToggle,
}: {
  persona: PersonaSummary;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="cursor-pointer border-b border-border/60 hover:bg-accent/40" onClick={onToggle}>
        <td className="px-4 py-2.5 font-medium">{persona.company}</td>
        <td className="px-4 py-2.5 text-xs">{persona.primary_persona || persona.department}</td>
        <td className="px-4 py-2.5 text-xs text-muted-foreground">{persona.functionalFamily}</td>
        <td className="px-4 py-2.5 text-xs text-muted-foreground">{persona.pitchArchetype}</td>
        <td className="px-4 py-2.5 text-xs" data-numeric>
          P{persona.priority}
        </td>
        <td className="px-4 py-2.5">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">{persona.validationStatus}</span>
        </td>
      </tr>
      {open && <ProfileDetailRow personaId={persona.personaId} />}
    </>
  );
}

function ProfilesTab() {
  const personas = usePersonas();
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'priority' | 'company'>('priority');
  const needle = search.trim().toLowerCase();
  const rows = (personas.data?.personas ?? [])
    .filter(
      (p: PersonaSummary) =>
        !needle ||
        [p.company, p.department, p.primary_persona, p.functionalFamily, p.pitchArchetype].some((v) =>
          v.toLowerCase().includes(needle),
        ),
    )
    .sort((a, b) =>
      sort === 'company'
        ? a.company.localeCompare(b.company)
        : a.priority - b.priority || a.company.localeCompare(b.company),
    );
  const pager = useClientPage(rows);

  const header = (label: string, key: 'priority' | 'company') => (
    <th className="px-4 py-2.5 font-medium">
      <button
        type="button"
        onClick={() => setSort(key)}
        className={cn('hover:text-foreground', sort === key && 'text-foreground')}
      >
        {label}
      </button>
    </th>
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <p className="rounded-lg bg-warning-soft px-3 py-2 text-xs font-medium text-warning">
          Internal only — buyer profiles must never be shared with or shown to customers.
        </p>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company, role, family…"
          className="ml-auto h-8 w-56 rounded-md border border-input bg-card px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {personas.isLoading ? (
        <div className="glass-surface animate-pulse rounded-xl p-8 text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="glass-surface rounded-xl p-8 text-center text-sm text-muted-foreground">
          {needle ? 'No profiles match the search.' : 'No profiles seeded yet.'}
        </div>
      ) : (
        <>
          <div className="glass-surface overflow-x-auto rounded-xl">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  {header('Company', 'company')}
                  <th className="px-4 py-2.5 font-medium">Person / role</th>
                  <th className="px-4 py-2.5 font-medium">Family</th>
                  <th className="px-4 py-2.5 font-medium">Pitch angle</th>
                  {header('Priority', 'priority')}
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pager.pageRows.map((persona) => (
                  <ProfileRow
                    key={persona.personaId}
                    persona={persona}
                    open={openId === persona.personaId}
                    onToggle={() => setOpenId(openId === persona.personaId ? null : persona.personaId)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <PaginationFooter
            page={pager.page}
            pageSize={pager.pageSize}
            total={pager.total}
            totalPages={pager.totalPages}
            noun="profiles"
            onPage={pager.setPage}
            onPageSize={pager.setPageSize}
          />
        </>
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
