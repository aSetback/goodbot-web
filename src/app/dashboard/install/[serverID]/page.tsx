import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getUserGuilds } from "@/lib/discord";
import { GuildIcon } from "@/components/GuildIcon";

export default async function DashboardInstallPage({
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
  const server = guilds.find((guild) => guild.id === serverID);
  if (!server) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16 text-center">
      <div className="mb-6 flex justify-center">
        <GuildIcon guild={server} />
      </div>
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        It looks like GoodBot is not installed on {server.name}.
      </h1>
      <a
        href="https://discordapp.com/oauth2/authorize?client_id=525115228686516244&permissions=8&scope=bot"
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-block rounded-full bg-amber-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
      >
        Add GoodBot
      </a>
    </div>
  );
}
