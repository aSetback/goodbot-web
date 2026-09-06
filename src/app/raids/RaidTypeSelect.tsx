"use client";

import { useState } from "react";
import type { RaidTypeOption } from "@/lib/raidsCatalog";

const inputClass =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

const CUSTOM_VALUE = "__custom__";

export function RaidTypeSelect({
  id,
  options,
  defaultValue,
}: {
  id?: string;
  options: RaidTypeOption[];
  defaultValue?: string;
}) {
  const isKnownValue = options.some((option) => option.value === defaultValue);
  const [customMode, setCustomMode] = useState(Boolean(defaultValue) && !isKnownValue);

  if (customMode) {
    return (
      <div className="flex gap-2">
        <input
          id={id}
          name="raid"
          defaultValue={isKnownValue ? "" : defaultValue}
          placeholder="e.g. SSC"
          className={inputClass}
          required
        />
        <button
          type="button"
          onClick={() => setCustomMode(false)}
          className="shrink-0 whitespace-nowrap text-sm text-amber-600 hover:text-amber-700"
        >
          Choose from list
        </button>
      </div>
    );
  }

  return (
    <select
      id={id}
      name="raid"
      defaultValue={defaultValue ?? ""}
      className={inputClass}
      required
      onChange={(event) => {
        if (event.target.value === CUSTOM_VALUE) {
          setCustomMode(true);
        }
      }}
    >
      <option value="" disabled>
        Please select a raid..
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      <option value={CUSTOM_VALUE}>Add Custom...</option>
    </select>
  );
}
