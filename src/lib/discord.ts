const DISCORD_API = process.env.BOT_API_URL ?? "https://discord.com/api";

export type DiscordGuild = {
  id: string;
  name: string;
  permissions: string | number;
};

export type DiscordGuildMember = {
  user?: { id: string; username: string };
  nick?: string | null;
};

// Server-to-server calls authenticated as the bot (mirrors Controller::botRequest).
async function botRequest<T>(
  endpoint: string,
  init?: { method?: string; body?: unknown }
): Promise<T> {
  const res = await fetch(`${DISCORD_API}${endpoint}`, {
    method: init?.method ?? (init?.body ? "POST" : "GET"),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bot ${process.env.BOT_TOKEN}`,
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  return res.json() as Promise<T>;
}

// Calls made on the signed-in user's behalf (mirrors Controller::apiRequest).
async function userRequest<T>(endpoint: string, accessToken: string): Promise<T> {
  const res = await fetch(`${DISCORD_API}${endpoint}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.json() as Promise<T>;
}

// The guilds the signed-in user belongs to, sorted like the PHP OAuth middleware sorted them.
export async function getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const guilds = await userRequest<DiscordGuild[]>("/users/@me/guilds", accessToken);
  return [...guilds].sort((a, b) => a.name.localeCompare(b.name));
}

// Discord represents "has every permission" (ADMINISTRATOR-equivalent) as this bitmask.
const ALL_PERMISSIONS = "2147483647";

export function isGuildAdmin(guild: Pick<DiscordGuild, "permissions">): boolean {
  return String(guild.permissions) === ALL_PERMISSIONS;
}

export async function goodBotInstalled(guildId: string): Promise<boolean> {
  const server = await botRequest<{ code?: number }>(`/guilds/${guildId}`);
  return server.code === undefined;
}

export async function getGuildMember(
  guildId: string,
  userId: string
): Promise<DiscordGuildMember> {
  return botRequest<DiscordGuildMember>(`/guilds/${guildId}/members/${userId}`);
}

export async function setGuildMemberNickname(
  guildId: string,
  userId: string,
  nick: string
): Promise<{ code?: number } | DiscordGuildMember> {
  return botRequest(`/guilds/${guildId}/members/${userId}`, {
    method: "PATCH",
    body: { nick },
  });
}

export async function sendGuildMessage(channelId: string, message: string): Promise<void> {
  await botRequest(`/channels/${channelId}/messages`, {
    method: "POST",
    body: { content: message },
  });
}
