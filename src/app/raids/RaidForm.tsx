"use client";

import { useActionState } from "react";
import { saveRaid } from "./actions";
import { RaidTypeSelect } from "./RaidTypeSelect";
import type { RaidTypeOption } from "@/lib/raidsCatalog";

const inputClass =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export type RaidFormInitial = {
  id: number;
  title: string;
  raid: string;
  date: string;
  time: string;
  description: string;
  color: string;
  confirmation: boolean;
  softreserve: boolean;
  channelName: string;
};

export function RaidForm({
  guildID,
  faction,
  raidOptions,
  initial,
}: {
  guildID: string;
  faction: string | null;
  raidOptions: RaidTypeOption[];
  initial?: RaidFormInitial;
}) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string }, formData: FormData) => saveRaid(formData),
    {}
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="guildID" value={guildID} />
      <input type="hidden" name="raidID" value={initial?.id ?? ""} />

      {faction === "Both" ? (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-500" htmlFor="faction">
            Faction
          </label>
          <select id="faction" name="faction" className={inputClass} required>
            <option value="Alliance">Alliance</option>
            <option value="Horde">Horde</option>
          </select>
        </div>
      ) : (
        <input type="hidden" name="faction" value={faction ?? ""} />
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-500" htmlFor="title">
          Title
        </label>
        <input id="title" name="title" defaultValue={initial?.title} className={inputClass} required />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-500" htmlFor="raid">
          Raid
        </label>
        <RaidTypeSelect id="raid" options={raidOptions} defaultValue={initial?.raid} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-500" htmlFor="date">
          Date
        </label>
        <input id="date" name="date" type="date" defaultValue={initial?.date} className={inputClass} required />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-500" htmlFor="time">
          Time
        </label>
        <input id="time" name="time" defaultValue={initial?.time} className={inputClass} required />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-500" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={initial?.description}
          className={inputClass}
          rows={4}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-500" htmlFor="channel">
          Channel Name
        </label>
        <input
          id="channel"
          name="channel"
          defaultValue={initial?.channelName}
          className={inputClass}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-500" htmlFor="color">
          Sidebar Color
        </label>
        <input
          id="color"
          name="color"
          type="color"
          defaultValue={initial?.color ?? "#FF9900"}
          className="h-9 w-16 rounded border border-zinc-300 dark:border-zinc-700"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-500" htmlFor="confirmation">
          Confirmation Mode
        </label>
        <select
          id="confirmation"
          name="confirmation"
          defaultValue={initial?.confirmation ? "1" : "0"}
          className={inputClass}
        >
          <option value="0">no</option>
          <option value="1">yes</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-500" htmlFor="softreserve">
          Soft Reserves
        </label>
        <select
          id="softreserve"
          name="softreserve"
          defaultValue={initial?.softreserve ? "1" : "0"}
          className={inputClass}
        >
          <option value="0">no</option>
          <option value="1">yes</option>
        </select>
      </div>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-amber-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </form>
  );
}
