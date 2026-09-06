import { auth } from "@/auth";
import { getUserGuilds, isGuildAdmin } from "@/lib/discord";

// Shared admin-permission check for server actions that modify guild-scoped
// data (raid settings, dashboard settings, etc.) -- throws if the signed-in
// user isn't an admin of the given guild.
export async function requireGuildAdmin(guildID: string): Promise<string> {
  const session = await auth();
  if (!session?.accessToken || !session.discordId) {
    throw new Error("Not signed in.");
  }
  const guilds = await getUserGuilds(session.accessToken);
  const isAdmin = guilds.some((guild) => guild.id === guildID && isGuildAdmin(guild));
  if (!isAdmin) {
    throw new Error("Not authorized for this server.");
  }
  return session.discordId;
}
