import Link from "next/link";

const TABS = [
  { key: "settings", label: "Settings", href: (id: number) => `/raids/${id}/settings` },
  { key: "roster", label: "Roster", href: (id: number) => `/raids/${id}/roster` },
  { key: "reserves", label: "Reserves", href: (id: number) => `/raids/${id}/reserves` },
] as const;

export function RaidTabs({
  raidID,
  active,
}: {
  raidID: number;
  active: (typeof TABS)[number]["key"];
}) {
  return (
    <div className="flex gap-6 border-b border-zinc-200 dark:border-zinc-800">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href(raidID)}
          className={
            tab.key === active
              ? "border-b-2 border-amber-600 pb-2 text-sm font-medium text-amber-600"
              : "border-b-2 border-transparent pb-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
