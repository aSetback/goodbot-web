"use server";

import { auth } from "@/auth";
import { getUserGuilds, isGuildAdmin, getGuildChannels, sendGuildAnnouncement } from "@/lib/discord";
import { Settings } from "@/lib/models";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin(serverID: string) {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("Not signed in.");
  }
  const guilds = await getUserGuilds(session.accessToken);
  const server = guilds.find((guild) => guild.id === serverID && isGuildAdmin(guild));
  if (!server) {
    throw new Error("Not authorized for this server.");
  }
}

// Mirrors DashboardController::postSettings().
export async function saveDashboardSettings(serverID: string, formData: FormData) {
  await requireAdmin(serverID);

  await Settings.upsert({
    guildID: serverID,
    faction: String(formData.get("faction") ?? "") || null,
    server: String(formData.get("wowServer") ?? "") || null,
    sheet: String(formData.get("sheetID") ?? "") || null,
  });

  revalidatePath(`/dashboard/${serverID}`);
  redirect(`/dashboard/${serverID}`);
}

// Mirrors DashboardController::setupSave().
export async function saveDashboardSetup(
  serverID: string,
  data: {
    server?: string;
    expansion?: string;
    faction?: string;
    raidCategoryChannelID?: string;
    runSetup?: boolean;
  }
) {
  await requireAdmin(serverID);

  const settings: {
    server?: string;
    expansion?: string;
    faction?: string;
    raidcategory?: string;
  } = {};

  if (data.server) {
    // data.server arrives as "US/Mankrik" (region/name) from the wizard's
    // select, but `settings` has no region column -- keep just the name.
    const [, wowServer] = data.server.split("/");
    settings.server = wowServer;
  }
  if (data.expansion) settings.expansion = data.expansion;
  if (data.faction) settings.faction = data.faction;

  if (data.raidCategoryChannelID) {
    const channels = await getGuildChannels(serverID);
    const category = channels.find((channel) => channel.id === data.raidCategoryChannelID);
    if (category) settings.raidcategory = category.name;
  }

  if (Object.keys(settings).length > 0) {
    const existing = await Settings.findOne({ where: { guildID: serverID } });
    if (existing) {
      await existing.update(settings);
    } else {
      await Settings.create({ guildID: serverID, ...settings });
    }
  }

  if (data.runSetup) {
    await sendGuildAnnouncement(serverID, "+setup");
  }

  revalidatePath(`/dashboard/${serverID}`);
  redirect(`/dashboard/${serverID}`);
}
