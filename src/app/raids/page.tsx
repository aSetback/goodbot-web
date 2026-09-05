import Link from "next/link";
import { notFound } from "next/navigation";
import { Op } from "sequelize";
import { auth } from "@/auth";
import { getUserGuilds } from "@/lib/discord";
import { Raid } from "@/lib/models";

export default async function RaidsIndexPage() {
  const session = await auth();
  if (!session?.accessToken || !session.discordId) {
    notFound();
  }

  const guilds = await getUserGuilds(session.accessToken);
  const guildsByID = new Map(guilds.map((guild) => [guild.id, guild]));

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const raids = await Raid.findAll({
    where: { memberID: session.discordId, date: { [Op.gte]: today, [Op.lt]: in90Days } },
    order: [["date", "ASC"]],
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Manage Raids</h1>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="py-2 font-medium">Discord</th>
            <th className="py-2 font-medium">Name</th>
            <th className="py-2 font-medium">Type</th>
            <th className="py-2 font-medium">Date</th>
            <th className="py-2 font-medium" />
            <th className="py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {raids.map((raid) => {
            const guild = guildsByID.get(raid.guildID);
            if (!guild) return null;
            return (
              <tr key={raid.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2">{guild.name}</td>
                <td className="py-2">{raid.title || raid.name || raid.raid}</td>
                <td className="py-2">{raid.raid}</td>
                <td className="py-2">{raid.date}</td>
                <td className="py-2">
                  <Link href={`/raids/lineup/${raid.id}`} className="text-amber-600 hover:text-amber-700">
                    Lineup
                  </Link>
                </td>
                <td className="py-2">
                  <Link
                    href={`/raids/reserves/${raid.id}`}
                    className="text-amber-600 hover:text-amber-700"
                  >
                    Reserves
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Link
        href="/raids/new"
        className="mt-6 inline-block rounded-full bg-amber-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
      >
        Create Raid
      </Link>
    </div>
  );
}
