"use server";

import { auth } from "@/auth";
import { getUserGuilds, isGuildAdmin } from "@/lib/discord";
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
