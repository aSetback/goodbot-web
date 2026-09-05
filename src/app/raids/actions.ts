"use server";

import { auth } from "@/auth";
import { Raid, Signup } from "@/lib/models";
import { sendGuildMessage } from "@/lib/discord";
import { revalidatePath } from "next/cache";

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
