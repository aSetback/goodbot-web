"use server";

import { Settings } from "@/lib/models";
import { requireGuildAdmin } from "@/lib/requireGuildAdmin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Mirrors DashboardController::postSettings().
export async function saveDashboardSettings(serverID: string, formData: FormData) {
  await requireGuildAdmin(serverID);

  await Settings.upsert({
    guildID: serverID,
    faction: String(formData.get("faction") ?? "") || null,
    server: String(formData.get("wowServer") ?? "") || null,
    sheet: String(formData.get("sheetID") ?? "") || null,
  });

  revalidatePath(`/dashboard/${serverID}`);
  redirect(`/dashboard/${serverID}`);
}
