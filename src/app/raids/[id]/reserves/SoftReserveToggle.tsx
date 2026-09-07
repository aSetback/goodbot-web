"use client";

import { useTransition } from "react";
import { setRaidSoftReserve } from "./actions";

export function SoftReserveToggle({ raidID, enabled }: { raidID: number; enabled: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <fieldset disabled={isPending} className="flex items-center gap-4 text-sm">
      <legend className="sr-only">Soft Reserve</legend>
      <span className="font-medium text-black dark:text-zinc-50">Soft Reserve:</span>
      <label className="flex cursor-pointer items-center gap-1.5">
        <input
          type="radio"
          name="softreserve"
          checked={enabled}
          onChange={() => startTransition(() => setRaidSoftReserve(raidID, true))}
        />
        Enabled
      </label>
      <label className="flex cursor-pointer items-center gap-1.5">
        <input
          type="radio"
          name="softreserve"
          checked={!enabled}
          onChange={() => startTransition(() => setRaidSoftReserve(raidID, false))}
        />
        Disabled
      </label>
    </fieldset>
  );
}
