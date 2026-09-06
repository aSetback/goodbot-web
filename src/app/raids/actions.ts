"use server";

import { auth } from "@/auth";
import { Raid, Signup } from "@/lib/models";
import { sendGuildMessage, createGuildChannel, getGuildChannel, renameChannel } from "@/lib/discord";
import { refreshRaidEmbed } from "@/lib/botInternalApi";
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
  revalidatePath(`/raids/lineup/${raidID}`);
}

// NOTE: these all post a "+"-prefixed text command into the raid channel,
// mirroring the old PHP site -- but the bot's message-command handler was
// fully removed during its slash-command rewrite (functions/messages.js's
// handle() is now an empty stub), so none of these actually do anything
// anymore. "refresh" is the one exception, wired up below to the bot's new
// internal API instead. The rest are left as-is pending the same treatment.
const COMMAND_MESSAGES: Record<string, string> = {
  pingall: "+pingraid",
  pingconfirmed: "+ping confirmed",
  pingnoreserve: "+noreserve",
  pingunsigned: "+unsigned",
  dupe: "+dupe",
  archive: "+archive",
};

// Mirrors RaidController::command().
export async function runRaidCommand(
  raidID: number,
  type: keyof typeof COMMAND_MESSAGES | "refresh"
) {
  const raid = await Raid.findByPk(raidID);
  if (!raid) {
    throw new Error("Raid not found.");
  }
  await requireRaidAccess(raid);

  if (type === "refresh") {
    await refreshRaidEmbed(raid.channelID);
  } else {
    const message = COMMAND_MESSAGES[type];
    if (message) {
      await sendGuildMessage(raid.channelID, message);
    }
  }

  revalidatePath(`/raids/lineup/${raidID}`);
  revalidatePath(`/raids/${raidID}/manage`);
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

function formatDateOnly(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Mirrors the date parsing in functions/raid.js's createRaidChannel(): a
// free-text "Mon-DD" string (e.g. "Jun-15"), forced onto the current year,
// rolled to next year if that's already in the past.
function parseBotStyleRaidDate(dateString: string): Date | null {
  const [monthPart, dayPart] = dateString.split("-");
  if (!monthPart || !dayPart) return null;
  const parsed = new Date(Date.parse(`${monthPart} ${dayPart}`));
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setFullYear(new Date().getFullYear());
  if (parsed.getTime() < Date.now()) {
    parsed.setFullYear(parsed.getFullYear() + 1);
  }
  return parsed;
}

// Mirrors the bot's /raid slash command modal (slashcommands/raid/raid.js)
// -- the same 4 fields (name, free-text date, free-text raid type, optional
// faction), the same channel-name convention ("<dateString>-<name>"), and
// the same defaults (no title/time/description, color #02a64f) it leaves
// the DB record with.
export async function createQuickRaid(
  serverID: string,
  formData: FormData
): Promise<SaveRaidResult> {
  const session = await auth();
  if (!session?.discordId) {
    return { error: "Not signed in." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const dateString = String(formData.get("dateString") ?? "").trim();
  const raidTypeRaw = String(formData.get("raidType") ?? "").trim();
  const factionRaw = String(formData.get("faction") ?? "").trim();

  if (!name || !dateString || !raidTypeRaw) {
    return { error: "Raid name, date, and type are required." };
  }

  const parsedDate = parseBotStyleRaidDate(dateString);
  if (!parsedDate) {
    return { error: `Could not parse raid date "${dateString}". Use a format like Jun-15.` };
  }

  const raidType = normalizeRaidType(raidTypeRaw);
  const faction = factionRaw ? factionRaw.toLowerCase() : null;
  const channelName = `${dateString}-${name}`;

  const raidData: RaidFields = {
    raid: raidType,
    name,
    title: "",
    date: formatDateOnly(parsedDate),
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
  // Also dead (see COMMAND_MESSAGES above) -- and unlike a refresh, creating
  // the *initial* embed needs a pinned message with sign-up buttons first,
  // which client.embed.update() alone doesn't create. Not fixed yet: raids
  // created here don't get a working sign-up embed until that's built too.
  await sendGuildMessage(raid.channelID, "+embed");

  return { raidID: raid.id };
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
