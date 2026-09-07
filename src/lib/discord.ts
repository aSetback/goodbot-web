const DISCORD_API = process.env.BOT_API_URL ?? "https://discord.com/api";

// Discord rate-limits some endpoints (notably /users/@me/guilds) tightly
// enough that two requests fired close together -- e.g. a double-clicked
// nav link kicking off two page loads that each fetch guilds -- can 429 the
// second one. Retry with the server-given backoff instead of letting that
// surface as an unhandled error that crashes the page.
async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, init);
    if (res.status !== 429) return res;
    const body = await res.clone().json().catch(() => null);
    const retryAfter = typeof body?.retry_after === "number" ? body.retry_after : 1;
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000 + 50));
  }
  return fetch(url, init);
}

export type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  permissions: string | number;
};

// Builds the CDN URL for a guild's icon (Discord hashes animated icons with
// an "a_" prefix and serves those as .gif, everything else as .png).
export function guildIconUrl(guild: Pick<DiscordGuild, "id" | "icon">): string | null {
  if (!guild.icon) return null;
  const ext = guild.icon.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}`;
}

export type DiscordGuildMember = {
  user?: { id: string; username: string };
  nick?: string | null;
  roles?: string[];
};

export type DiscordRole = {
  id: string;
  name: string;
  permissions: string;
};

export type DiscordChannelOverwrite = {
  id: string;
  type: number | string;
  allow: string;
  deny: string;
};

export type DiscordChannel = {
  id: string;
  name: string;
  type: number;
  parent_id?: string | null;
  permission_overwrites?: DiscordChannelOverwrite[];
};

// Server-to-server calls authenticated as the bot (mirrors Controller::botRequest).
async function botRequest<T>(
  endpoint: string,
  init?: { method?: string; body?: unknown }
): Promise<T> {
  const res = await fetchWithRetry(`${DISCORD_API}${endpoint}`, {
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
  const res = await fetchWithRetry(`${DISCORD_API}${endpoint}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const body = await res.json();
  if (!res.ok) {
    // A bad/expired access token (or a revoked app grant) lands here even
    // after auth.ts's proactive refresh -- fail with something diagnosable
    // instead of letting callers blow up trying to use an error object
    // (e.g. {message, code}) as if it were the expected array/record shape.
    throw new Error(`Discord API error ${res.status} on ${endpoint}: ${JSON.stringify(body)}`);
  }
  return body as T;
}

// Every raid sub-page (roster/reserves/settings/actions) calls this once to
// check access, so clicking through tabs quickly fires several of these in
// a row for a guild list that hasn't changed -- the retrying in
// fetchWithRetry helps once it's rate-limited, but it's better to not ask
// Discord again at all. Cache by access token (and share the in-flight
// promise) for a short window so a burst of nav clicks costs one real
// request instead of one per click.
const guildsCache = new Map<string, { promise: Promise<DiscordGuild[]>; expiresAt: number }>();
const GUILDS_CACHE_TTL_MS = 15_000;

export function getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const cached = guildsCache.get(accessToken);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise;
  }

  const promise = userRequest<DiscordGuild[]>("/users/@me/guilds", accessToken).then((guilds) =>
    [...guilds].sort((a, b) => a.name.localeCompare(b.name))
  );
  promise.catch(() => guildsCache.delete(accessToken));
  guildsCache.set(accessToken, { promise, expiresAt: Date.now() + GUILDS_CACHE_TTL_MS });
  return promise;
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

export type GuildMemberSearchResult = {
  id: string;
  name: string;
};

// Discord's member search matches on username or nickname prefix.
export async function searchGuildMembers(
  guildId: string,
  query: string,
  limit = 10
): Promise<GuildMemberSearchResult[]> {
  if (!query.trim()) return [];
  const members = await botRequest<DiscordGuildMember[]>(
    `/guilds/${guildId}/members/search?query=${encodeURIComponent(query)}&limit=${limit}`
  );
  if (!Array.isArray(members)) return [];
  return members
    .filter((member) => member.user)
    .map((member) => ({
      id: member.user!.id,
      name: member.nick || member.user!.username,
    }));
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

// Mirrors Controller::sendMessage() when called with a guild ID instead of a
// channel ID: posts to the guild's first text channel.
export async function sendGuildAnnouncement(guildId: string, message: string): Promise<void> {
  const channels = await getGuildChannels(guildId);
  const textChannel = channels.find((channel) => channel.type === 0);
  if (textChannel) {
    await sendGuildMessage(textChannel.id, message);
  }
}

export async function getGuildChannels(guildId: string): Promise<DiscordChannel[]> {
  return botRequest<DiscordChannel[]>(`/guilds/${guildId}/channels`);
}

export async function getGuildChannel(channelId: string): Promise<DiscordChannel> {
  return botRequest<DiscordChannel>(`/channels/${channelId}`);
}

export async function createGuildChannel(
  guildId: string,
  params: { name: string; type: number; parent_id?: string }
): Promise<DiscordChannel> {
  return botRequest<DiscordChannel>(`/guilds/${guildId}/channels`, { body: params });
}

export async function renameChannel(channelId: string, name: string): Promise<DiscordChannel> {
  return botRequest<DiscordChannel>(`/channels/${channelId}`, { method: "PATCH", body: { name } });
}

export async function getGuildRoles(guildId: string): Promise<DiscordRole[]> {
  return botRequest<DiscordRole[]>(`/guilds/${guildId}/roles`);
}

// Mirrors Raid::getRoles() -- the signed-in member's roles on this guild, keyed by role ID.
export async function getMemberRoles(
  guildId: string,
  userId: string
): Promise<Record<string, DiscordRole>> {
  const [member, roles] = await Promise.all([
    getGuildMember(guildId, userId),
    getGuildRoles(guildId),
  ]);
  const rolesByID = new Map(roles.map((role) => [role.id, role]));
  const memberRoles: Record<string, DiscordRole> = {};
  for (const roleID of member.roles ?? []) {
    const role = rolesByID.get(roleID);
    if (role) memberRoles[roleID] = role;
  }
  return memberRoles;
}

const ADMINISTRATOR = 0x8;
const MANAGE_CHANNELS = 0x10;

// Mirrors Raid::hasPermission() -- true if the member's effective permissions
// on this category (role permissions plus any role-based overwrite allows)
// include ADMINISTRATOR or MANAGE_CHANNELS.
export function hasChannelManagePermission(
  memberRoles: Record<string, DiscordRole>,
  category: DiscordChannel | null
): boolean {
  const effective: Record<string, bigint> = {};
  for (const [id, role] of Object.entries(memberRoles)) {
    effective[id] = BigInt(role.permissions);
  }
  for (const overwrite of category?.permission_overwrites ?? []) {
    if (String(overwrite.type) === "0" || overwrite.type === "role") {
      if (effective[overwrite.id] !== undefined) {
        effective[overwrite.id] |= BigInt(overwrite.allow);
      }
    }
  }
  return Object.values(effective).some(
    (permissions) =>
      (permissions & BigInt(ADMINISTRATOR)) === BigInt(ADMINISTRATOR) ||
      (permissions & BigInt(MANAGE_CHANNELS)) === BigInt(MANAGE_CHANNELS)
  );
}
