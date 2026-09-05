"use client";

import { useTransition } from "react";
import { runRaidCommand } from "../../actions";

const COMMANDS: { type: Parameters<typeof runRaidCommand>[1]; label: string }[] = [
  { type: "pingall", label: "Ping Raid" },
  { type: "pingconfirmed", label: "Ping Confirmed" },
  { type: "pingnoreserve", label: "Ping No Reserve" },
  { type: "pingunsigned", label: "Ping Unsigned" },
  { type: "dupe", label: "Dupe" },
  { type: "archive", label: "Archive" },
];

export function CommandButtons({ raidID }: { raidID: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {COMMANDS.map(({ type, label }) => (
        <button
          key={type}
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => runRaidCommand(raidID, type))}
          className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
