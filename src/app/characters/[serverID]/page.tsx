import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getUserGuilds, goodBotInstalled, getGuildMember } from "@/lib/discord";
import { Character } from "@/lib/models";
import { CharacterManager } from "./CharacterManager";

const CLASSES = [
  "warrior",
  "paladin",
  "shaman",
  "hunter",
  "rogue",
  "druid",
  "priest",
  "warlock",
  "mage",
];
const ROLES = ["dps", "caster", "tank", "healer"];

export default async function CharacterServerPage({
  params,
}: {
  params: Promise<{ serverID: string }>;
}) {
  const { serverID } = await params;
  const session = await auth();
  if (!session?.accessToken || !session.discordId) {
    notFound();
  }

  const guilds = await getUserGuilds(session.accessToken);
  const server = guilds.find((guild) => guild.id === serverID);
  if (!server) {
    notFound();
  }

  if (!(await goodBotInstalled(serverID))) {
    return (
      <div className="mx-auto w-full max-w-lg px-6 py-16 text-center">
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
          GoodBot isn&apos;t set up on {server.name} yet
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Add the bot to this server, then come back here to set up your characters.
        </p>
      </div>
    );
  }

  const member = await getGuildMember(serverID, session.discordId);
  const nick = member.nick || member.user?.username || "";

  const main = nick ? await Character.findOne({ where: { name: nick, guildID: serverID } }) : null;
  const alts = main
    ? await Character.findAll({ where: { mainID: main.id }, order: [["name", "ASC"]] })
    : [];
  const characters = main ? [main, ...alts] : [];

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">{server.name}</h1>
      <CharacterManager
        serverID={serverID}
        nick={nick}
        classes={CLASSES}
        roles={ROLES}
        characters={characters.map((character) => ({
          id: character.id,
          name: character.name,
          class: character.class,
          role: character.role,
          isMain: character.mainID == null,
        }))}
      />
    </div>
  );
}
