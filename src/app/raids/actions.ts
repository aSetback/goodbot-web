"use server";

import { auth } from "@/auth";
import { Raid, Signup } from "@/lib/models";
import { sendGuildMessage, createGuildChannel, getGuildChannel, renameChannel } from "@/lib/discord";
import { resolveRaidCategory } from "@/lib/raidChannel";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Mirrors RaidController::confirm()/unconfirm().
export async function setSignupConfirmed(raidID: number, signupID: number, confirmed: boolean) {
  const session = await auth();
  if (!session?.discordId) {
    throw new Error("Not signed in.");
  }

  await Signup.update({ confirmed }, { where: { id: signupID } });
  revalidatePath(`/raids/lineup/${raidID}`);
}

const COMMAND_MESSAGES: Record<string, string> = {
  pingall: "+pingraid",
  pingconfirmed: "+ping confirmed",
  pingnoreserve: "+noreserve",
  pingunsigned: "+unsigned",
  refresh: "+embed refresh",
  dupe: "+dupe",
  archive: "+archive",
};

// Mirrors RaidController::command().
export async function runRaidCommand(raidID: number, type: keyof typeof COMMAND_MESSAGES) {
  const session = await auth();
  if (!session?.discordId) {
    throw new Error("Not signed in.");
  }

  const raid = await Raid.findByPk(raidID);
  if (!raid) {
    throw new Error("Raid not found.");
  }

  const message = COMMAND_MESSAGES[type];
  if (message) {
    await sendGuildMessage(raid.channelID, message);
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

  const result = raidID
    ? await updateRaid(raidID, channelName, raidData)
    : await createRaid(guildID, raidType, faction, channelName, session.discordId, raidData);

  if (result.error) {
    return result;
  }

  revalidatePath("/raids");
  redirect("/raids");
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
  await sendGuildMessage(raid.channelID, "+embed refresh");

  return { raidID: raid.id };
}
