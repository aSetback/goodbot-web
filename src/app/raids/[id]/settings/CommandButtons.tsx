"use client";

import { useState, useTransition } from "react";
import { runRaidCommand, duplicateRaid } from "../../actions";

const COMMANDS: { type: Parameters<typeof runRaidCommand>[1]; label: string }[] = [
  { type: "pingall", label: "Ping Raid" },
  { type: "pingconfirmed", label: "Ping Confirmed" },
  { type: "pingnoreserve", label: "Ping No Reserve" },
  { type: "archive", label: "Archive" },
];

export function CommandButtons({ raidID }: { raidID: number }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {COMMANDS.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            disabled={isPending}
            onClick={() => run(() => runRaidCommand(raidID, type))}
            className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            run(async () => {
              const result = await duplicateRaid(raidID);
              if (result.error) throw new Error(result.error);
            })
          }
          className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Dupe (+7 days)
        </button>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
