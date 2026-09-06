import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Raid, Settings } from "@/lib/models";
import { getGuildChannel, getUserGuilds, isGuildAdmin } from "@/lib/discord";
import { RaidForm } from "../../RaidForm";
import { CommandButtons } from "./CommandButtons";

export default async function ManageRaidPage({
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
  if (!session?.accessToken) {
    notFound();
  }
  const guilds = await getUserGuilds(session.accessToken);
  if (!guilds.some((guild) => guild.id === raid.guildID && isGuildAdmin(guild))) {
    notFound();
  }

  const [channel, settings] = await Promise.all([
    getGuildChannel(raid.channelID),
    Settings.findOne({ where: { guildID: raid.guildID } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        Manage Raid &mdash; {raid.title || raid.name}
      </h1>
      <Link
        href={`/dashboard/${raid.guildID}/raids`}
        className="text-sm text-amber-600 hover:text-amber-700"
      >
        &larr; Back
      </Link>

      <div className="mt-4">
        <CommandButtons raidID={raid.id} />
      </div>

      <div className="mt-8">
        <RaidForm
          guildID={raid.guildID}
          faction={settings?.faction ?? null}
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
          }}
        />
      </div>
    </div>
  );
}
