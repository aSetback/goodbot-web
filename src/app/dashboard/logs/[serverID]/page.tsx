import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getUserGuilds, isGuildAdmin } from "@/lib/discord";
import { Log } from "@/lib/models";

const PAGE_SIZE = 100;

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

  const logs = await Log.findAll({
    where: { guildID: serverID },
    order: [["createdAt", "DESC"]],
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        Logs &mdash; {server.name}
      </h1>
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
            const [event, member, channel] = log.event.split("/");
            return (
              <tr key={log.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2">{event}</td>
                <td className="py-2">{member?.replace("Member: ", "")}</td>
                <td className="py-2">{channel?.replace("Channel: ", "")}</td>
                <td className="py-2">{log.createdAt.toLocaleString()}</td>
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
