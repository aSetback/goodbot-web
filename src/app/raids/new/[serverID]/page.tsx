import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getUserGuilds, isGuildAdmin } from "@/lib/discord";
import { Settings } from "@/lib/models";
import { RaidForm } from "../../RaidForm";

export default async function NewRaidPage({
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

  const settings = await Settings.findOne({ where: { guildID: serverID } });

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        New Raid &mdash; {server.name}
      </h1>
      <div className="mt-6">
        <RaidForm guildID={serverID} faction={settings?.faction ?? null} />
      </div>
    </div>
  );
}
