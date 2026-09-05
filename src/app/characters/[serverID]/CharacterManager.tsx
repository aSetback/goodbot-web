"use client";

import { useState, useTransition } from "react";
import { saveCharacter } from "./actions";

type CharacterRow = {
  id: number;
  name: string;
  class: string | null;
  role: string | null;
  isMain: boolean;
};

const selectClass =
  "rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900";
const inputClass = selectClass;

function CharacterForm({
  serverID,
  classes,
  roles,
  initial,
  onDone,
  onCancel,
}: {
  serverID: string;
  classes: string[];
  roles: string[];
  initial?: CharacterRow;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded border border-zinc-200 p-4 dark:border-zinc-800"
      action={(formData) => {
        setError(null);
        const name = String(formData.get("name") ?? "");
        const characterClass = String(formData.get("class") ?? "");
        const role = String(formData.get("role") ?? "");
        startTransition(async () => {
          const result = await saveCharacter(serverID, initial?.id ?? 0, name, characterClass, role);
          if (result.error) {
            setError(result.error);
          } else {
            onDone();
          }
        });
      }}
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500" htmlFor="name">
          Character
        </label>
        <input
          id="name"
          name="name"
          defaultValue={initial?.name}
          className={inputClass}
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500" htmlFor="class">
          Class
        </label>
        <select id="class" name="class" defaultValue={initial?.class ?? ""} className={selectClass} required>
          <option value="" disabled>
            -
          </option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500" htmlFor="role">
          Role
        </label>
        <select id="role" name="role" defaultValue={initial?.role ?? ""} className={selectClass} required>
          <option value="" disabled>
            -
          </option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
      >
        Save Character
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Cancel
        </button>
      )}
      {error && <p className="w-full text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}

export function CharacterManager({
  serverID,
  nick,
  classes,
  roles,
  characters,
}: {
  serverID: string;
  nick: string;
  classes: string[];
  roles: string[];
  characters: CharacterRow[];
}) {
  const [editingID, setEditingID] = useState<number | null>(null);
  const [adding, setAdding] = useState(characters.length === 0);

  if (characters.length === 0) {
    return (
      <div className="mt-6">
        <h2 className="text-lg font-medium text-black dark:text-zinc-50">
          You don&apos;t have a character set up on this server yet, {nick}!
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Let&apos;s fix that.</p>
        <div className="mt-4">
          <CharacterForm
            serverID={serverID}
            classes={classes}
            roles={roles}
            initial={{ id: 0, name: nick, class: null, role: null, isMain: true }}
            onDone={() => setAdding(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="py-2 font-medium">Character</th>
            <th className="py-2 font-medium">Class</th>
            <th className="py-2 font-medium">Role</th>
            <th className="py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {characters.map((character) => (
            <tr key={character.id} className="border-b border-zinc-100 dark:border-zinc-900">
              <td className="py-2">
                <span className="mr-2 text-xs text-amber-600">
                  {character.isMain ? "main" : "alt"}
                </span>
                {character.name}
              </td>
              <td className="py-2">{character.class}</td>
              <td className="py-2">{character.role}</td>
              <td className="py-2 text-right">
                <button
                  type="button"
                  onClick={() => setEditingID(character.id)}
                  className="text-zinc-500 hover:text-black dark:hover:text-zinc-50"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingID !== null && (
        <div className="mt-4">
          <CharacterForm
            serverID={serverID}
            classes={classes}
            roles={roles}
            initial={characters.find((c) => c.id === editingID)}
            onDone={() => setEditingID(null)}
            onCancel={() => setEditingID(null)}
          />
        </div>
      )}

      {adding && (
        <div className="mt-4">
          <CharacterForm
            serverID={serverID}
            classes={classes}
            roles={roles}
            onDone={() => setAdding(false)}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {editingID === null && !adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-4 text-sm text-amber-600 hover:text-amber-700"
        >
          + Add Character
        </button>
      )}
    </div>
  );
}
