import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getUserGuilds, isGuildAdmin, getGuildChannels } from "@/lib/discord";
import { Log } from "@/lib/models";
import { CopyIconButton } from "@/components/CopyIconButton";
import { GuildIcon } from "@/components/GuildIcon";

const PAGE_SIZE = 100;

// The event column is a slash-delimited string like:
// "Signup: + / Member: Setback (93398761979514880) / Channel: general / Guild: Choo Choo (...)"
// -- but some (mostly older) rows omit the Member segment, or have extra
// description segments before Channel/Guild, so this can't be split by
// fixed position. Member name/ID are also already denormalized onto their
// own columns, which are more reliable than re-parsing them out of the text.
function parseEventDescription(event: string): string {
  return event.split(/\s*\/\s*(?:Member|Channel|Guild):/)[0].trim();
}

function parseChannelName(event: string): string | null {
  const match = event.match(/Channel:\s*([^/]+)/);
  return match ? match[1].trim() : null;
}

function formatLogDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  const hours24 = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const hours = hours24 % 12 || 12;
  return `${mm}/${dd}/${yy} @ ${hours}:${minutes}${ampm}`;
}

export default async function DashboardLogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ serverID: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  const { serverID } = await params;
  const { p } = await searchParams;
  const page = Math.max(1, Number(p) || 1);

  const session = await auth();
  if (!session?.accessToken) {
    notFound();
  }

  const guilds = await getUserGuilds(session.accessToken);
  const server = guilds.find((guild) => guild.id === serverID && isGuildAdmin(guild));
  if (!server) {
    notFound();
  }

  const [logs, channels] = await Promise.all([
    Log.findAll({
      where: { guildID: serverID },
      order: [["createdAt", "DESC"]],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    getGuildChannels(serverID),
  ]);

  const channelIdsByName = new Map(
    channels.map((channel) => [channel.name.toLowerCase().trim(), channel.id])
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-4 flex justify-center">
        <GuildIcon guild={server} />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Logs &mdash; {server.name}
        </h1>
        <Link
          href={`/dashboard/${serverID}`}
          className="text-sm text-amber-600 hover:text-amber-700"
        >
          &larr; Back
        </Link>
      </div>

      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="py-2 font-medium">Event</th>
            <th className="py-2 font-medium">User</th>
            <th className="py-2 font-medium">Channel</th>
            <th className="py-2 font-medium">Time/Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const channelName = parseChannelName(log.event);
            const channelId = channelName ? channelIdsByName.get(channelName.toLowerCase()) : undefined;
            return (
              <tr key={log.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2">{parseEventDescription(log.event)}</td>
                <td className="py-2">
                  <div className="flex items-center gap-1.5">
                    <span>{log.memberName ?? "-"}</span>
                    {log.memberID && <CopyIconButton value={log.memberID} />}
                  </div>
                </td>
                <td className="py-2">
                  {channelName &&
                    (channelId ? (
                      <a
                        href={`https://discord.com/channels/${serverID}/${channelId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-600 hover:text-amber-700"
                      >
                        {channelName}
                      </a>
                    ) : (
                      <span>{channelName}</span>
                    ))}
                </td>
                <td className="py-2 whitespace-nowrap">{formatLogDate(log.createdAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4 flex justify-end gap-4 text-sm">
        {page > 1 && (
          <Link
            href={`/dashboard/logs/${serverID}?p=${page - 1}`}
            className="text-amber-600 hover:text-amber-700"
          >
            &larr; Previous
          </Link>
        )}
        <Link
          href={`/dashboard/logs/${serverID}?p=${page + 1}`}
          className="text-amber-600 hover:text-amber-700"
        >
          Next &rarr;
        </Link>
      </div>
    </div>
  );
}
