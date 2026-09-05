"use server";

import { auth } from "@/auth";
import { Signup, RaidReserve } from "@/lib/models";
import { revalidatePath } from "next/cache";

// Mirrors GoodBotController::reserve() in the PHP site: no ownership check
// on the signup, matching existing behavior (any authenticated visitor of
// this raid's reserve page can set any signup's reserve) -- not something
// introduced by this port.
export async function saveReserve(token: string, signupID: number, itemID: number) {
  const session = await auth();
  if (!session?.discordId) {
    throw new Error("Not signed in.");
  }

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

  revalidatePath(`/r/${token}`);
}
