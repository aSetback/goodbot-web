import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Raid, Settings } from "@/lib/models";
import { getGuildChannel, getGuildMember, getUserGuilds } from "@/lib/discord";
import { hasRaidAccess } from "@/lib/requireRaidAccess";
import { raidOptionsForExpansion } from "@/lib/raidsCatalog";
import { formatRaidDate } from "@/lib/formatRaidDate";
import { Breadcrumbs } from "../../Breadcrumbs";
import { RaidForm } from "../../RaidForm";
import { RaidTabs } from "../../RaidTabs";
import { CommandButtons } from "./CommandButtons";

export default async function RaidSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const raid = await Raid.findByPk(Number(id));
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

  const [channel, settings, leader] = await Promise.all([
    getGuildChannel(raid.channelID),
    Settings.findOne({ where: { guildID: raid.guildID } }),
    getGuildMember(raid.guildID, raid.memberID),
  ]);
  const leaderName = leader.nick || leader.user?.username || raid.memberID;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div>
        <Breadcrumbs
          items={[
            { label: "Raids", href: `/dashboard/${raid.guildID}/raids` },
            { label: raid.title || raid.name },
          ]}
        />
        <h1 className="mt-1 text-2xl font-semibold text-black dark:text-zinc-50">
          {raid.title || raid.name}
        </h1>
        <p className="text-sm text-zinc-500">{formatRaidDate(raid.date)}</p>
      </div>

      <div className="mt-6">
        <RaidTabs raidID={raid.id} active="settings" />
      </div>

      <div className="mt-6">
        <CommandButtons raidID={raid.id} />
      </div>

      <div className="mt-8 max-w-xl">
        <RaidForm
          guildID={raid.guildID}
          faction={settings?.faction ?? null}
          raidOptions={raidOptionsForExpansion(settings?.expansion)}
          initial={{
            id: raid.id,
            title: raid.title ?? raid.name,
            raid: raid.raid.toLowerCase(),
            date: raid.date,
            time: raid.time ?? "",
            description: raid.description ?? "",
            color: raid.color || "#FF9900",
            confirmation: Boolean(raid.confirmation),
            softreserve: Boolean(raid.softreserve),
            channelName: channel.name,
            leaderMemberID: raid.memberID,
            leaderName,
          }}
        />
      </div>
    </div>
  );
}
