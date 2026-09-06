"use server";

import { auth } from "@/auth";
import { Raid, Signup } from "@/lib/models";
import { createGuildChannel, getGuildChannel, renameChannel } from "@/lib/discord";
import { refreshRaidEmbed, initRaidEmbed, pingRaid, archiveRaidChannel, type PingType } from "@/lib/botInternalApi";
import { resolveRaidCategory } from "@/lib/raidChannel";
import { normalizeRaidType } from "@/lib/raidsCatalog";
import { requireRaidAccess } from "@/lib/requireRaidAccess";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Mirrors RaidController::confirm()/unconfirm().
export async function setSignupConfirmed(raidID: number, signupID: number, confirmed: boolean) {
  const raid = await Raid.findByPk(raidID);
  if (!raid) {
    throw new Error("Raid not found.");
  }
  await requireRaidAccess(raid);

  await Signup.update({ confirmed }, { where: { id: signupID } });
  revalidatePath(`/raids/${raidID}/roster`);
}

const PING_TYPES: Record<string, PingType> = {
  pingall: "all",
  pingconfirmed: "confirmed",
  pingnoreserve: "noreserve",
};

// Mirrors RaidController::command(). These used to post "+"-prefixed text
// commands into the raid channel, matching the old PHP site -- but the
// bot's message-command handler was fully removed during its
// slash-command rewrite (functions/messages.js's handle() is now an empty
// stub), so none of them did anything anymore. Now calls the bot's
// internal API directly instead. "pingunsigned" isn't included: it needs a
// second, caller-chosen raid/channel to compare against (see
// client.notify.getUnsigned in the bot repo), which there's no UI for yet.
// "dupe" is its own action below (it needs to create a whole new raid, not
// just act on the existing one).
export async function runRaidCommand(
  raidID: number,
  type: "refresh" | "pingall" | "pingconfirmed" | "pingnoreserve" | "archive"
) {
  const raid = await Raid.findByPk(raidID);
  if (!raid) {
    throw new Error("Raid not found.");
  }
  await requireRaidAccess(raid);

  if (type === "refresh") {
    await refreshRaidEmbed(raid.channelID);
  } else if (type === "archive") {
    await archiveRaidChannel(raid.channelID);
  } else {
    await pingRaid(raid.channelID, PING_TYPES[type]);
  }

  revalidatePath(`/raids/${raidID}/roster`);
  revalidatePath(`/raids/${raidID}/settings`);
}

type SaveRaidResult = { error?: string; raidID?: number };

type RaidFields = {
  raid: string;
  name: string;
  title: string;
  date: string;
  time: string;
  description: string;
  confirmation: boolean;
  softreserve: boolean;
  color: string;
  faction: string | null;
  memberID: string;
  guildID: string;
};

// Mirrors RaidController::postSave() + Raid::createRaid()/updateRaid().
export async function saveRaid(formData: FormData): Promise<SaveRaidResult> {
  const session = await auth();
  if (!session?.discordId) {
    return { error: "Not signed in." };
  }

  const raidID = Number(formData.get("raidID") ?? 0);
  const guildID = String(formData.get("guildID") ?? "");
  const raidType = String(formData.get("raid") ?? "");
  const channelName = String(formData.get("channel") ?? "");
  const title = String(formData.get("title") ?? "");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const description = String(formData.get("description") ?? "");
  const confirmation = formData.get("confirmation") === "1";
  const softreserve = formData.get("softreserve") === "1";
  const color = String(formData.get("color") ?? "") || "#FF9900";
  const faction = String(formData.get("faction") ?? "") || null;

  if (!guildID || !raidType || !channelName || !title || !date || !time || !description) {
    return { error: "Please fill out all required fields." };
  }

  const raidData: RaidFields = {
    raid: raidType,
    name: title,
    title,
    date,
    time,
    description,
    confirmation,
    softreserve,
    color,
    faction,
    memberID: session.discordId,
    guildID,
  };

  if (raidID) {
    const existingRaid = await Raid.findByPk(raidID);
    if (!existingRaid) {
      return { error: "Raid not found." };
    }
    await requireRaidAccess(existingRaid);
    const result = await updateRaid(raidID, channelName, raidData);
    if (result.error) {
      return result;
    }
    // Edits are reached from the guild-scoped dashboard raid list, not the
    // personal cross-guild /raids list -- send the admin back there.
    revalidatePath(`/dashboard/${guildID}/raids`);
    redirect(`/dashboard/${guildID}/raids`);
  }

  const result = await createRaid(guildID, raidType, faction, channelName, session.discordId, raidData);
  if (result.error) {
    return result;
  }

  revalidatePath("/raids");
  redirect("/raids");
}

// Formats a picked date the way the bot names its raid channels (e.g.
// "Jun-15"), for visual consistency with raids created via the bot's own
// /raid modal.
function toBotStyleDateString(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }).replace(" ", "-");
}

// Mirrors the bot's /raid slash command modal (slashcommands/raid/raid.js)
// -- name, date, raid type, and optional faction, the same channel-name
// convention ("<Mon-D>-<name>"), and the same defaults (no title/time/
// description, color #02a64f) it leaves the DB record with. Unlike the
// bot's free-text date field, this uses a real date picker (so no ambiguous
// "which year did they mean" parsing is needed).
export async function createQuickRaid(
  serverID: string,
  formData: FormData
): Promise<SaveRaidResult> {
  const session = await auth();
  if (!session?.discordId) {
    return { error: "Not signed in." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const raidTypeRaw = String(formData.get("raid") ?? "").trim();
  const factionRaw = String(formData.get("faction") ?? "").trim();

  if (!name || !date || !raidTypeRaw) {
    return { error: "Raid name, date, and type are required." };
  }

  const raidType = normalizeRaidType(raidTypeRaw);
  const faction = factionRaw ? factionRaw.toLowerCase() : null;
  const channelName = `${toBotStyleDateString(date)}-${name}`;

  const raidData: RaidFields = {
    raid: raidType,
    name,
    title: "",
    date,
    time: "",
    description: "",
    confirmation: false,
    softreserve: false,
    color: "#02a64f",
    faction,
    memberID: session.discordId,
    guildID: serverID,
  };

  const result = await createRaid(serverID, raidType, faction, channelName, session.discordId, raidData);
  if (!result.error) {
    revalidatePath(`/dashboard/${serverID}/raids`);
  }
  return result;
}

async function createRaid(
  guildID: string,
  raidType: string,
  faction: string | null,
  channelName: string,
  discordId: string,
  raidData: RaidFields
): Promise<SaveRaidResult> {
  const category = await resolveRaidCategory(guildID, raidType, faction, discordId);
  if (!category) {
    return { error: "No permissions." };
  }

  const channel = await createGuildChannel(guildID, {
    name: channelName,
    type: 0,
    parent_id: category.id,
  });

  const raid = await Raid.create({ ...raidData, channelID: channel.id });
  await initRaidEmbed(raid.channelID);

  return { raidID: raid.id };
}

// Mirrors slashcommands/raid/dupe.js -- duplicates a raid `days` days out,
// reusing the same channel-creation path as a fresh raid (category
// resolution + permission check + embed init) rather than the message-based
// "+dupe" the bot no longer listens for.
export async function duplicateRaid(raidID: number, days = 7): Promise<SaveRaidResult> {
  const original = await Raid.findByPk(raidID);
  if (!original) {
    return { error: "Raid not found." };
  }
  const discordId = await requireRaidAccess(original);

  const newDate = new Date(original.date + "T00:00:00");
  newDate.setDate(newDate.getDate() + days);
  const isoDate = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}-${String(newDate.getDate()).padStart(2, "0")}`;
  const dateString = newDate
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .replace(" ", "-");
  const channelName = `${dateString}-${original.name}`;

  const raidData: RaidFields = {
    raid: original.raid,
    name: original.name,
    title: original.title ?? "",
    date: isoDate,
    time: original.time ?? "",
    description: original.description ?? "",
    confirmation: Boolean(original.confirmation),
    softreserve: Boolean(original.softreserve),
    color: original.color,
    faction: original.faction ?? null,
    memberID: discordId,
    guildID: original.guildID,
  };

  const result = await createRaid(
    original.guildID,
    original.raid,
    original.faction ?? null,
    channelName,
    discordId,
    raidData
  );

  if (!result.error) {
    revalidatePath(`/dashboard/${original.guildID}/raids`);
  }
  return result;
}

async function updateRaid(
  raidID: number,
  channelName: string,
  raidData: RaidFields
): Promise<SaveRaidResult> {
  const raid = await Raid.findByPk(raidID);
  if (!raid) {
    return { error: "Raid not found." };
  }

  const channel = await getGuildChannel(raid.channelID);
  if (channel.name !== channelName) {
    await renameChannel(raid.channelID, channelName);
  }

  await raid.update(raidData);
  await refreshRaidEmbed(raid.channelID);

  return { raidID: raid.id };
}
