import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getUserGuilds, isGuildAdmin } from "@/lib/discord";
import { Settings } from "@/lib/models";
import { saveDashboardSettings } from "../../actions";
import { NA_SERVER_LIST, EU_SERVER_LIST } from "../../wowServers";

const inputClass =
  "w-full rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export default async function DashboardSettingsPage({
  params,
}: {
  params: Promise<{ serverID: string }>;
}) {
  const { serverID } = await params;
  const session = await auth();
  if (!session?.accessToken) {
    notFound();
  }

  const guilds = await getUserGuilds(session.accessToken);
  const server = guilds.find((guild) => guild.id === serverID && isGuildAdmin(guild));
  if (!server) {
    notFound();
  }

  const settings = await Settings.findOne({ where: { guildID: serverID } });
  const saveAction = saveDashboardSettings.bind(null, serverID);

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-12">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        Settings &mdash; {server.name}
      </h1>
      <form action={saveAction} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-500" htmlFor="faction">
            Faction
          </label>
          <select id="faction" name="faction" defaultValue={settings?.faction ?? ""} className={inputClass}>
            <option value=""></option>
            <option>Alliance</option>
            <option>Horde</option>
            <option>Both</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-500" htmlFor="region">
            Region
          </label>
          <select id="region" name="region" defaultValue={settings?.region ?? ""} className={inputClass}>
            <option value=""></option>
            <option>NA</option>
            <option>EU</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-500" htmlFor="wowServer">
            Server
          </label>
          <select
            id="wowServer"
            name="wowServer"
            defaultValue={settings?.server ?? ""}
            className={inputClass}
          >
            <option value=""></option>
            <optgroup label="North America/Oceanic">
              {NA_SERVER_LIST.map((wowServer) => (
                <option key={wowServer}>{wowServer}</option>
              ))}
            </optgroup>
            <optgroup label="Europe">
              {EU_SERVER_LIST.map((wowServer) => (
                <option key={wowServer}>{wowServer}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-500" htmlFor="sheetID">
            Google Spreadsheet ID
          </label>
          <input
            id="sheetID"
            name="sheetID"
            defaultValue={settings?.sheet ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <button
            type="submit"
            className="rounded-full bg-amber-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
