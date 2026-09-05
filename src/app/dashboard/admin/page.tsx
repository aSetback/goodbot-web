import { notFound } from "next/navigation";
import { Log, Raid, Guild, Signup } from "@/lib/models";
import { AutoRefresh } from "./AutoRefresh";

// Mirrors DashboardController::admin() -- a key-gated ops page, not part of
// the OAuth-protected dashboard. No DASHBOARD_KEY configured means nobody
// can reach this page, same as the PHP `!env('dashboard_key')` check.
//
// The PHP view rendered a fully standalone HTML document; the App Router
// only allows one root <html>/<body> (in layout.tsx), so this reuses the
// site chrome instead of trying to opt out of it.
export default async function DashboardAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  if (!process.env.DASHBOARD_KEY || key !== process.env.DASHBOARD_KEY) {
    notFound();
  }

  const [logs, raids, guilds] = await Promise.all([
    Log.findAll({ order: [["createdAt", "DESC"]], limit: 100 }),
    Raid.findAll({ order: [["createdAt", "DESC"]], limit: 20 }),
    Guild.findAll({ order: [["createdAt", "DESC"]], limit: 20 }),
  ]);

  const guildsByID = new Map(guilds.map((guild) => [guild.guildID, guild]));
  const signupCounts = new Map(
    await Promise.all(
      raids.map(
        async (raid) => [raid.id, await Signup.count({ where: { raidID: raid.id } })] as const
      )
    )
  );

  const thClass = "py-1.5 pr-4 text-left font-medium text-zinc-400";
  const tdClass = "py-1.5 pr-4 border-t border-dotted border-zinc-700";

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-2">
      <AutoRefresh intervalMs={30_000} />
      <div>
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Logs</h2>
        <table className="mt-2 w-full text-sm">
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className={tdClass}>{log.event}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Latest Guilds</h2>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr>
              <th className={thClass}>ID</th>
              <th className={thClass}>Name</th>
              <th className={thClass}>Added At</th>
            </tr>
          </thead>
          <tbody>
            {guilds.map((guild) => (
              <tr key={guild.id}>
                <td className={tdClass}>{guild.guildID}</td>
                <td className={tdClass}>{guild.name}</td>
                <td className={tdClass}>{guild.createdAt.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:col-span-2">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Latest Raids</h2>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr>
              <th className={thClass}>Name</th>
              <th className={thClass}>Raid</th>
              <th className={thClass}>Signups</th>
              <th className={thClass}>Guild</th>
              <th className={thClass}>Created</th>
            </tr>
          </thead>
          <tbody>
            {raids.map((raid) => (
              <tr key={raid.id}>
                <td className={tdClass}>{raid.name}</td>
                <td className={tdClass}>{raid.raid}</td>
                <td className={tdClass}>{signupCounts.get(raid.id) ?? 0}</td>
                <td className={tdClass}>{guildsByID.get(raid.guildID)?.name ?? "-"}</td>
                <td className={tdClass}>{raid.createdAt?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
