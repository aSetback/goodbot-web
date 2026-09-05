"use client";

import { useTransition } from "react";
import { saveReserve } from "./actions";

export function ReserveSelect({
  raidID,
  signupID,
  currentItemID,
  items,
}: {
  raidID: number;
  signupID: number;
  currentItemID: number;
  items: { id: number; name: string }[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentItemID}
      disabled={isPending}
      className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      onChange={(event) => {
        const itemID = Number(event.target.value);
        startTransition(() => {
          saveReserve(raidID, signupID, itemID);
        });
      }}
    >
      <option value={0}>None</option>
      {items.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );
}
