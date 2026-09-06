"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createQuickRaid } from "@/app/raids/actions";
import { RaidTypeSelect } from "@/app/raids/RaidTypeSelect";
import type { RaidTypeOption } from "@/lib/raidsCatalog";

const inputClass =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function AddRaidModal({
  serverID,
  raidOptions,
}: {
  serverID: string;
  raidOptions: RaidTypeOption[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
      >
        Add New
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6 dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Create a raid</h2>
            <form
              className="mt-4 flex flex-col gap-4"
              action={(formData) => {
                setError(null);
                startTransition(async () => {
                  const result = await createQuickRaid(serverID, formData);
                  if (result.error) {
                    setError(result.error);
                  } else {
                    setOpen(false);
                    router.refresh();
                  }
                });
              }}
            >
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-500" htmlFor="name">
                  Raid Name
                </label>
                <input id="name" name="name" className={inputClass} required />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-500" htmlFor="date">
                  Raid Date
                </label>
                <input id="date" name="date" type="date" className={inputClass} required />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-500" htmlFor="raid">
                  What instance are you raiding?
                </label>
                <RaidTypeSelect id="raid" options={raidOptions} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-500" htmlFor="faction">
                  What faction is this for? (not required)
                </label>
                <input id="faction" name="faction" className={inputClass} />
              </div>

              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                >
                  Create Raid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
