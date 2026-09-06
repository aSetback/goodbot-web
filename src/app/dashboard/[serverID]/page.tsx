import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getUserGuilds, isGuildAdmin, goodBotInstalled } from "@/lib/discord";

const LINKS = [
  { href: "settings", label: "Settings" },
  { href: "logs", label: "Logs" },
];

export default async function DashboardServerPage({
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

  if (!(await goodBotInstalled(serverID))) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-16 text-center">
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
          It looks like GoodBot is not installed on this server.
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

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">{server.name}</h1>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href={`/dashboard/${serverID}/raids`}
          className="rounded border border-zinc-200 px-4 py-6 text-center font-medium text-zinc-700 transition-colors hover:border-amber-600 hover:text-amber-600 dark:border-zinc-800 dark:text-zinc-300"
        >
          Raids
        </Link>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={`/dashboard/${link.href}/${serverID}`}
            className="rounded border border-zinc-200 px-4 py-6 text-center font-medium text-zinc-700 transition-colors hover:border-amber-600 hover:text-amber-600 dark:border-zinc-800 dark:text-zinc-300"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
