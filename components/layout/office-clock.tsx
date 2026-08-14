'use client';

/**
 * The company clock in the top bar.
 *
 * KST is always the headline, because that is the clock the business runs on:
 * a lead arrives at a Korean hour and its SLA is counted in Korean hours,
 * whichever office picks it up. When the viewer is somewhere else, their own
 * time sits next to it — an offset you can read at a glance beats one you
 * have to work out at handover.
 */

import { useSyncExternalStore } from 'react';

import {
  OPERATING_SITE,
  SITES,
  clockAt,
  clockInZone,
  hoursFromOperating,
  viewerSite,
  viewerTimeZone,
} from '@/lib/time/zones';
import { cn } from '@/lib/utils';

/**
 * Ticks on the minute boundary, not every 60s from mount — otherwise the
 * display sits up to a full minute behind the wall clock it claims to show.
 */
function subscribeToTheMinute(onChange: () => void) {
  let interval: ReturnType<typeof setInterval>;
  const timeout = setTimeout(
    () => {
      onChange();
      interval = setInterval(onChange, 60_000);
    },
    (60 - new Date().getSeconds()) * 1000,
  );
  return () => {
    clearTimeout(timeout);
    clearInterval(interval);
  };
}

export function OfficeClock({ className }: { className?: string }) {
  // The server has no viewer zone and no honest "now", so its snapshot is
  // null and the clock appears after hydration. Rendering a server time here
  // would be a hydration mismatch AND a wrong number.
  const minute = useSyncExternalStore(
    subscribeToTheMinute,
    () => Math.floor(Date.now() / 60_000),
    () => null,
  );

  if (minute === null) return null;
  const now = new Date(minute * 60_000);

  const zone = viewerTimeZone();
  const elsewhere = zone !== OPERATING_SITE.timeZone;
  const here = viewerSite();
  const offset = here ? hoursFromOperating(here, now) : null;

  const tooltip = SITES.map((site) => `${site.city} ${clockAt(site, now)} ${site.label}`).join(' · ');

  return (
    <div
      className={cn('hidden items-baseline gap-1.5 text-xs sm:flex', className)}
      title={`${tooltip}${here ? '' : ` · you ${clockInZone(zone, now)} (${zone})`}`}
    >
      <span className="font-medium tabular-nums" data-numeric>
        {clockAt(OPERATING_SITE, now)}
      </span>
      <span className="text-muted-foreground">{OPERATING_SITE.label}</span>

      {elsewhere && (
        <>
          <span className="mx-0.5 h-3 w-px self-center bg-border" />
          <span className="tabular-nums text-muted-foreground" data-numeric>
            {clockInZone(zone, now)}
          </span>
          <span className="text-muted-foreground">
            {here ? here.label : 'you'}
            {offset !== null && offset !== 0 && ` ${offset > 0 ? '+' : ''}${offset}h`}
          </span>
        </>
      )}
    </div>
  );
}
