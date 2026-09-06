import { auth } from "@/auth";
import { getUserGuilds, isGuildAdmin, type DiscordGuild } from "@/lib/discord";

type RaidLike = { guildID: string; memberID: string };

export function hasRaidAccess(guilds: DiscordGuild[], raid: RaidLike, discordId: string): boolean {
  if (discordId === raid.memberID) {
    return true;
  }
  return guilds.some((guild) => guild.id === raid.guildID && isGuildAdmin(guild));
}

// A raid's roster/reserves/settings can be managed by a full admin of its
// guild (the dashboard entry point) or by whoever's memberID created it (the
// personal /raids entry point) -- the PHP app never checked this at all, so
// this is already strictly more restrictive, but a plain isGuildAdmin check
// would incorrectly lock a raid leader out of their own raid if they aren't
// a full server admin.
export async function requireRaidAccess(raid: RaidLike): Promise<string> {
  const session = await auth();
  if (!session?.accessToken || !session.discordId) {
    throw new Error("Not signed in.");
  }
  if (session.discordId === raid.memberID) {
    return session.discordId;
  }
  const guilds = await getUserGuilds(session.accessToken);
  if (!hasRaidAccess(guilds, raid, session.discordId)) {
    throw new Error("Not authorized for this raid.");
  }
  return session.discordId;
}
