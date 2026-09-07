"use client";

import { useState, useTransition } from "react";
import { setAllSignupsConfirmed, copyConfirmations, type CopyConfirmSource } from "../../actions";

export function RosterBulkActions({
  raidID,
  channelOptions,
  defaultChannelID,
}: {
  raidID: number;
  channelOptions: CopyConfirmSource[];
  defaultChannelID: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => setAllSignupsConfirmed(raidID, true))}
        className="rounded-full bg-green-600 px-4 py-1.5 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
      >
        Confirm All
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => setAllSignupsConfirmed(raidID, false))}
        className="rounded-full bg-red-600 px-4 py-1.5 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
      >
        Unconfirm All
      </button>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="rounded-full border border-zinc-300 px-4 py-1.5 font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        Copy Confirms
      </button>

      {modalOpen && (
        <CopyConfirmsModal
          raidID={raidID}
          channelOptions={channelOptions}
          defaultChannelID={defaultChannelID}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

function CopyConfirmsModal({
  raidID,
  channelOptions,
  defaultChannelID,
  onClose,
}: {
  raidID: number;
  channelOptions: CopyConfirmSource[];
  defaultChannelID: string | null;
  onClose: () => void;
}) {
  const defaultOption = channelOptions.find((option) => option.channelID === defaultChannelID) ?? null;
  const [query, setQuery] = useState(defaultOption?.label ?? "");
  const [selected, setSelected] = useState<CopyConfirmSource | null>(defaultOption);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered =
    query.trim() === ""
      ? channelOptions
      : channelOptions.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));

  function handleSubmit() {
    if (!selected) {
      setError("Pick a channel to copy from.");
      return;
    }
    setError(null);
    startTransition(async () => {
      await copyConfirmations(raidID, selected.channelID);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Copy Confirms</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Copy confirmed sign-ups from another raid channel into this one.
        </p>

        <div className="relative mt-4">
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(null);
            }}
            placeholder="Search channels..."
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          {!selected && filtered.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-zinc-300 bg-white text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              {filtered.map((option) => (
                <li key={option.channelID}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(option);
                      setQuery(option.label);
                    }}
                    className="block w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleSubmit}
            className="rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
