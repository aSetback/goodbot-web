import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getUserGuilds } from "@/lib/discord";

export default async function CharacterServersPage() {
  const session = await auth();
  if (!session?.accessToken) {
    notFound();
  }

  const guilds = await getUserGuilds(session.accessToken);

  return (
    <div className="mx-auto w-full max-w-lg px-6 py-12">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Select a Server</h1>
      <ul className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
        {guilds.map((guild) => (
          <li key={guild.id}>
            <Link
              href={`/characters/${guild.id}`}
              className="block py-3 text-sm text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              {guild.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
