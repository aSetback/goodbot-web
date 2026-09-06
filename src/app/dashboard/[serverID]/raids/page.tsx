import Link from "next/link";
import { notFound } from "next/navigation";
import { Op } from "sequelize";
import { auth } from "@/auth";
import { getUserGuilds, isGuildAdmin, getGuildMember } from "@/lib/discord";
import { Raid } from "@/lib/models";
import { raidTypeName } from "@/lib/raidsCatalog";
import { AddRaidModal } from "./AddRaidModal";

export default async function DashboardRaidsPage({
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

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const raids = await Raid.findAll({
    where: {
      guildID: serverID,
      date: { [Op.gte]: today },
      [Op.or]: [{ archived: null }, { archived: false }],
    },
    order: [["date", "ASC"]],
  });

  const leaderIDs = [...new Set(raids.map((raid) => raid.memberID))];
  const leaderEntries = await Promise.all(
    leaderIDs.map(async (memberID) => {
      const member = await getGuildMember(serverID, memberID);
      return [memberID, member.nick || member.user?.username || memberID] as const;
    })
  );
  const leaderNames = new Map(leaderEntries);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Raids &mdash; {server.name}
          </h1>
          <Link
            href={`/dashboard/${serverID}`}
            className="text-sm text-amber-600 hover:text-amber-700"
          >
            &larr; Back
          </Link>
        </div>
        <AddRaidModal serverID={serverID} />
      </div>

      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="py-2 font-medium">Date</th>
            <th className="py-2 font-medium">Raid Type</th>
            <th className="py-2 font-medium">Raid Leader</th>
          </tr>
        </thead>
        <tbody>
          {raids.map((raid) => (
            <tr key={raid.id} className="border-b border-zinc-100 dark:border-zinc-900">
              <td className="py-2">{raid.date}</td>
              <td className="py-2">{raidTypeName(raid.raid)}</td>
              <td className="py-2">{leaderNames.get(raid.memberID) ?? raid.memberID}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
