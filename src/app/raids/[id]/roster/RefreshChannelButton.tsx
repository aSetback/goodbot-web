"use client";

import { useTransition } from "react";
import { runRaidCommand } from "../../actions";

export function RefreshChannelButton({ raidID }: { raidID: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => runRaidCommand(raidID, "refresh"))}
      className="rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
    >
      Refresh Channel
    </button>
  );
}
