"use server";

import { auth } from "@/auth";
import { Raid, Signup, RaidReserve } from "@/lib/models";
import { requireRaidAccess } from "@/lib/requireRaidAccess";
import { revalidatePath } from "next/cache";

// Mirrors GoodBotController::reserve(), used by the admin-facing raid
// reserves page (as opposed to the token-gated /r/[token] page).
export async function saveReserve(raidID: number, signupID: number, itemID: number) {
  const session = await auth();
  if (!session?.discordId) {
    throw new Error("Not signed in.");
  }

  const raid = await Raid.findByPk(raidID);
  if (!raid) {
    throw new Error("Raid not found.");
  }
  await requireRaidAccess(raid);

  const signup = await Signup.findByPk(signupID);
  if (!signup) {
    throw new Error("Signup not found.");
  }

  if (itemID === 0) {
    await RaidReserve.destroy({ where: { signupID, raidID: signup.raidID } });
  } else {
    const [reserve] = await RaidReserve.findOrBuild({
      where: { signupID, raidID: signup.raidID },
    });
    reserve.reserveItemID = itemID;
    reserve.memberID = session.discordId;
    await reserve.save();
  }

  revalidatePath(`/raids/${raidID}/reserves`);
}
