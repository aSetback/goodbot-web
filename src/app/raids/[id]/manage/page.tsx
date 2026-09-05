import { notFound } from "next/navigation";
import { Raid, Settings } from "@/lib/models";
import { getGuildChannel } from "@/lib/discord";
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

  const [channel, settings] = await Promise.all([
    getGuildChannel(raid.channelID),
    Settings.findOne({ where: { guildID: raid.guildID } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        Manage Raid &mdash; {raid.title || raid.name}
      </h1>

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
