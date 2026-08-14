'use client';

/**
 * Ownership of a lead, in one control.
 *
 * Before this, the console could only ever assign a lead to *you* — "Take it"
 * and "Assign to me". The backend endpoint has always accepted any owner; the
 * UI simply never offered one. On a rota where the person who triages is not
 * the person who works the lead, that gap is the whole problem.
 *
 * So: team leaders get the roster and can hand a lead to anyone; everyone
 * else keeps self-claim (lib/auth/roles.ts holds that policy, and the open
 * question behind it).
 *
 * Known backend behaviour, not fixed here: assign is last-write-wins. Two
 * people assigning the same lead at the same moment will not conflict — the
 * later write silently wins. It's on the backend wishlist as an atomic claim.
 */

import { Check, ChevronDown, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { normalizeError } from '@/lib/api/errors';
import { useAuth } from '@/lib/auth/auth-context';
import { canAssignToOthers, canClaimLeads } from '@/lib/auth/roles';
import { useAssignLead } from '@/lib/leads/hooks';
import { assignableMembers, useTeam } from '@/lib/team';

export function AssignControl({ leadId, owner }: { leadId: string; owner: string | null }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const assign = useAssignLead(leadId);
  const isLeader = canAssignToOthers(user);
  // Only leaders ever open the roster, so only leaders pay for fetching it.
  const team = useTeam('', isLeader);
  const members = assignableMembers(team.data?.results);

  function handoff(to: string | null, description: string) {
    assign.mutate(to, {
      onSuccess: () => toast({ title: description, tone: 'success' }),
      onError: (error) => toast({ title: normalizeError(error).message, tone: 'destructive' }),
    });
  }

  if (!isLeader) {
    // Everyone else: claim it, or read who has it.
    if (owner) return <span className="text-xs text-muted-foreground">Owner: {owner}</span>;
    if (!canClaimLeads(user)) return null;
    return (
      <Button size="sm" disabled={assign.isPending} onClick={() => handoff(user!.email, 'This lead is yours')}>
        Take it
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {owner && <span className="text-xs text-muted-foreground">Owner: {owner}</span>}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant={owner ? 'outline' : 'primary'} disabled={assign.isPending}>
            <UserPlus className="h-3.5 w-3.5" />
            {owner ? 'Reassign' : 'Assign'}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={6} className="w-64">
          {user?.email && (
            <>
              <DropdownMenuItem onClick={() => handoff(user.email, 'This lead is yours')}>
                <span>Take it myself</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {team.isLoading && <div className="px-2 py-1.5 text-xs text-muted-foreground">Loading team…</div>}

          {members.map((member) => {
            const isOwner = owner === member.name || owner === member.email;
            return (
              <DropdownMenuItem
                key={member.id}
                onClick={() => handoff(member.email, `Assigned to ${member.name}`)}
              >
                <span className="min-w-0 flex-1 truncate">
                  {member.name}
                  <span className="block text-xs text-muted-foreground">
                    {member.role} · {member.openLeads} open
                  </span>
                </span>
                {isOwner && <Check className="h-3.5 w-3.5 shrink-0" />}
              </DropdownMenuItem>
            );
          })}

          {owner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handoff(null, 'Back in the unassigned queue')}>
                <span>Put back in the queue</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
