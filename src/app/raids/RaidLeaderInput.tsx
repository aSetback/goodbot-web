"use client";

import { useEffect, useRef, useState } from "react";

const inputClass =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

type MemberResult = { id: string; name: string };

export function RaidLeaderInput({
  guildID,
  defaultMemberID,
  defaultName,
}: {
  guildID: string;
  defaultMemberID: string;
  defaultName: string;
}) {
  const [query, setQuery] = useState(defaultName);
  const [memberID, setMemberID] = useState(defaultMemberID);
  const [results, setResults] = useState<MemberResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If the query still matches a name we already resolved to an ID (i.e.
    // nothing changed since a selection, or this is the initial value),
    // there's nothing to search for.
    if (query === defaultName && memberID === defaultMemberID) return;

    const trimmed = query.trim();
    if (!trimmed) return;

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/guilds/${guildID}/members?q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) return;
        const data: MemberResult[] = await res.json();
        setResults(data);
        setOpen(true);
      } catch {
        // ignore -- transient search failures shouldn't block the rest of the form
      }
    }, 250);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-search on query changes
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name="memberID" value={memberID} />
      <input
        type="text"
        value={query}
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          if (!value.trim()) {
            setResults([]);
            setOpen(false);
          }
        }}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search for a member..."
        className={inputClass}
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded border border-zinc-300 bg-white text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {results.map((member) => (
            <li key={member.id}>
              <button
                type="button"
                onClick={() => {
                  setMemberID(member.id);
                  setQuery(member.name);
                  setResults([]);
                  setOpen(false);
                }}
                className="block w-full px-3 py-1.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {member.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
