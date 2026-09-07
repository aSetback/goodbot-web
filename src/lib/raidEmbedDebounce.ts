import { refreshRaidEmbed } from "@/lib/botInternalApi";

const REFRESH_DELAY_MS = 15_000;
const pendingRefreshes = new Map<number, NodeJS.Timeout>();

// Confirming players one at a time (or via the bulk actions) can fire many
// confirmation updates in a row -- coalesce them into a single embed
// refresh 15s after the last one instead of hitting the bot's internal API
// (and Discord's message-edit rate limit) once per click. Relies on
// `next start` being a single long-running process, not a fresh instance
// per request.
export function scheduleRaidEmbedRefresh(raidID: number, channelID: string): void {
  const existing = pendingRefreshes.get(raidID);
  if (existing) clearTimeout(existing);

  const timeout = setTimeout(() => {
    pendingRefreshes.delete(raidID);
    refreshRaidEmbed(channelID).catch((error) => {
      console.error(`Failed to refresh raid embed for raid ${raidID}`, error);
    });
  }, REFRESH_DELAY_MS);

  pendingRefreshes.set(raidID, timeout);
}
