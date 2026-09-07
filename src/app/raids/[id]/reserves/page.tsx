import { notFound } from "next/navigation";
import { Op } from "sequelize";
import { auth } from "@/auth";
import { Raid, Signup, RaidReserve, ReserveItem } from "@/lib/models";
import { getUserGuilds } from "@/lib/discord";
import { hasRaidAccess } from "@/lib/requireRaidAccess";
import { formatRaidDate } from "@/lib/formatRaidDate";
import { Breadcrumbs } from "../../Breadcrumbs";
import { RaidTabs } from "../../RaidTabs";
import { ReserveSelect } from "./ReserveSelect";
import { SoftReserveToggle } from "./SoftReserveToggle";

export default async function AdminReservesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const raidID = Number(id);

  const raid = await Raid.findByPk(raidID);
  if (!raid) {
    notFound();
  }

  const session = await auth();
  if (!session?.accessToken || !session.discordId) {
    notFound();
  }
  const guilds = await getUserGuilds(session.accessToken);
  if (!hasRaidAccess(guilds, raid, session.discordId)) {
    notFound();
  }

  const signups = await Signup.findAll({
    where: { raidID: raid.id, signup: "yes" },
    include: [{ model: RaidReserve, as: "reserve", include: [{ model: ReserveItem, as: "item" }] }],
    order: [["player", "ASC"]],
  });

  const raidParts = raid.raid.split("+");
  const items = await ReserveItem.findAll({
    where: { raid: { [Op.in]: raidParts } },
    order: [["name", "ASC"]],
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
      <div>
        <Breadcrumbs
          items={[
            { label: "Raids", href: `/dashboard/${raid.guildID}/raids` },
            { label: raid.name || raid.raid },
          ]}
        />
        <h1 className="mt-1 text-2xl font-semibold text-black dark:text-zinc-50">
          {raid.name || raid.raid}
        </h1>
        <p className="text-sm text-zinc-500">{formatRaidDate(raid.date)}</p>
      </div>

      <RaidTabs raidID={raid.id} active="reserves" />

      <SoftReserveToggle raidID={raid.id} enabled={Boolean(raid.softreserve)} />

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="py-2 font-medium">Name</th>
            <th className="py-2 font-medium">Reserve</th>
          </tr>
        </thead>
        <tbody>
          {signups.map((signup) => (
            <tr key={signup.id} className="border-b border-zinc-100 dark:border-zinc-900">
              <td className="py-2">{signup.player}</td>
              <td className="py-2">
                <ReserveSelect
                  raidID={raid.id}
                  signupID={signup.id}
                  currentItemID={signup.reserve?.item?.id ?? 0}
                  items={items.map((item) => ({ id: item.id, name: item.name }))}
                  disabled={!raid.softreserve}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
