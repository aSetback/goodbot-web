import { notFound } from "next/navigation";
import { Op } from "sequelize";
import { Raid, RaidHash } from "@/lib/models";
import { encodeReserveToken } from "@/lib/reserveToken";

// Mirrors GoodBotController::index($raidName) -- a member+guild-scoped
// "magic link" (identified by an opaque hash, not the base64 reserve
// token) that the bot embeds, listing that member's upcoming raids.
export default async function RaidHashPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash: hashValue } = await params;
  const hash = await RaidHash.findOne({ where: { hash: hashValue } });
  if (!hash) {
    notFound();
  }

  const now = new Date();
  const in3Months = new Date(now.getTime());
  in3Months.setMonth(in3Months.getMonth() + 3);

  const raids = await Raid.findAll({
    where: {
      memberID: hash.memberID,
      guildID: hash.guildID,
      date: { [Op.gt]: now.toISOString().slice(0, 10), [Op.lt]: in3Months.toISOString().slice(0, 10) },
    },
    order: [["date", "ASC"]],
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        Raid Signups: {hashValue}
      </h1>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="py-2 font-medium">Date</th>
            <th className="py-2 font-medium">Name</th>
            <th className="py-2 font-medium">Raid Type</th>
            <th className="py-2 font-medium" colSpan={3}>
              Links
            </th>
          </tr>
        </thead>
        <tbody>
          {raids.map((raid) => (
            <tr key={raid.id} className="border-b border-zinc-100 dark:border-zinc-900">
              <td className="py-2">{raid.date}</td>
              <td className="py-2">{raid.name || raid.raid}</td>
              <td className="py-2">{raid.raid}</td>
              <td className="py-2">
                <a href={`/signups/${raid.id}`} className="text-amber-600 hover:text-amber-700">
                  Signups &rarr;
                </a>
              </td>
              <td className="py-2">
                <a
                  href={`/r/${encodeReserveToken(raid.id, raid.memberID)}`}
                  className="text-amber-600 hover:text-amber-700"
                >
                  Reserves &rarr;
                </a>
              </td>
              <td className="py-2">
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`discord://discord.com/channels/${raid.guildID}/${raid.channelID}`}
                  className="text-amber-600 hover:text-amber-700"
                >
                  Discord &rarr;
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
