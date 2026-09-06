// Calls the GoodBot bot's own localhost-only internal API (see
// functions/internalApi.js in the bot repo) instead of posting "+"-prefixed
// text commands into the raid channel -- those stopped doing anything once
// the bot migrated to slash commands (its message-command handler is now an
// empty stub), so this is the actual way to trigger bot actions now.
export async function refreshRaidEmbed(channelID: string): Promise<void> {
  const baseUrl = process.env.INTERNAL_BOT_API_URL;
  if (!baseUrl) {
    console.error("INTERNAL_BOT_API_URL is not configured; skipping embed refresh.");
    return;
  }

  const res = await fetch(`${baseUrl}/embed/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.INTERNAL_BOT_API_SECRET}`,
    },
    body: JSON.stringify({ channelID }),
  });

  if (!res.ok) {
    throw new Error(`Bot internal API error ${res.status} refreshing embed for ${channelID}`);
  }
}
