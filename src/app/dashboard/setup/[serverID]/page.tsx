import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getUserGuilds, isGuildAdmin, getGuildChannels } from "@/lib/discord";
import { SetupWizard } from "./SetupWizard";

const CATEGORY_CHANNEL_TYPE = 4;

export default async function DashboardSetupPage({
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

  const channels = await getGuildChannels(serverID);
  const categoryChannels = channels
    .filter((channel) => channel.type === CATEGORY_CHANNEL_TYPE)
    .map((channel) => ({ id: channel.id, name: channel.name }));

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-12">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        Set-up &mdash; {server.name}
      </h1>
      <div className="mt-6">
        <SetupWizard serverID={serverID} categoryChannels={categoryChannels} />
      </div>
    </div>
  );
}
