import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Raid } from "@/lib/models";
import { getUserGuilds } from "@/lib/discord";
import { hasRaidAccess } from "@/lib/requireRaidAccess";
import { formatRaidDate } from "@/lib/formatRaidDate";
import { Breadcrumbs } from "../../Breadcrumbs";
import { RaidTabs } from "../../RaidTabs";
import { CommandButtons } from "./CommandButtons";

export default async function RaidActionsPage({
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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
      <div>
        <Breadcrumbs
          items={[
            { label: "Raids", href: `/dashboard/${raid.guildID}/raids` },
            { label: raid.name },
          ]}
        />
        <h1 className="mt-1 text-2xl font-semibold text-black dark:text-zinc-50">{raid.name}</h1>
        <p className="text-sm text-zinc-500">{formatRaidDate(raid.date)}</p>
      </div>

      <RaidTabs raidID={raid.id} active="actions" />

      <CommandButtons raidID={raid.id} />
    </div>
  );
}
