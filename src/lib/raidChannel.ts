import { Settings, RaidCategory } from "@/lib/models";
import {
  getGuildChannels,
  getMemberRoles,
  hasChannelManagePermission,
  type DiscordChannel,
} from "@/lib/discord";

const DEFAULT_CATEGORY = "Raid Signups";

// Mirrors Raid::getCategory() -- resolves which Discord category a new raid
// channel should live under, then checks the signed-in member actually has
// permission to manage channels there. Returns null if they don't.
export async function resolveRaidCategory(
  guildID: string,
  raid: string,
  faction: string | null,
  discordId: string
): Promise<DiscordChannel | null> {
  const settings = await Settings.findOne({ where: { guildID } });
  let categoryName = settings?.raidcategory || DEFAULT_CATEGORY;

  const raidCategory = await RaidCategory.findOne({
    where: faction ? { guildID, raid, faction } : { guildID, raid },
  });
  if (raidCategory) {
    categoryName = raidCategory.category;
  }

  const channels = await getGuildChannels(guildID);
  const category = channels.find((channel) => channel.name === categoryName) ?? null;
  if (!category) {
    return null;
  }

  const memberRoles = await getMemberRoles(guildID, discordId);
  return hasChannelManagePermission(memberRoles, category) ? category : null;
}
