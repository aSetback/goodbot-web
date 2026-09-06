// Calls the GoodBot bot's own localhost-only internal API (see
// functions/internalApi.js in the bot repo) instead of posting "+"-prefixed
// text commands into the raid channel -- those stopped doing anything once
// the bot migrated to slash commands (its message-command handler is now an
// empty stub), so this is the actual way to trigger bot actions now.
async function callBotApi(path: string, body: Record<string, unknown>): Promise<void> {
  const baseUrl = process.env.INTERNAL_BOT_API_URL;
  if (!baseUrl) {
    console.error(`INTERNAL_BOT_API_URL is not configured; skipping ${path}.`);
    return;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.INTERNAL_BOT_API_SECRET}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Bot internal API error ${res.status} on ${path}: ${text}`);
  }
}

export async function refreshRaidEmbed(channelID: string): Promise<void> {
  await callBotApi("/embed/refresh", { channelID });
}

// Sends the initial pinned sign-up message (with Yes/No/Maybe buttons) and
// fills in the real embed content -- needed once, right after a raid
// channel is first created (embed/refresh alone only edits an *existing*
// pinned message).
export async function initRaidEmbed(channelID: string): Promise<void> {
  await callBotApi("/embed/init", { channelID });
}

export type PingType = "all" | "confirmed" | "noreserve";

export async function pingRaid(channelID: string, type: PingType): Promise<void> {
  await callBotApi("/raid/ping", { channelID, type });
}

export async function archiveRaidChannel(channelID: string): Promise<void> {
  await callBotApi("/raid/archive", { channelID });
}
