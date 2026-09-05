"use server";

import { auth } from "@/auth";
import { Character } from "@/lib/models";
import { getGuildMember, setGuildMemberNickname } from "@/lib/discord";
import { revalidatePath } from "next/cache";

async function getNick(serverID: string, discordId: string): Promise<string> {
  const member = await getGuildMember(serverID, discordId);
  return member.nick || member.user?.username || "";
}

async function getMain(serverID: string, discordId: string) {
  const nick = await getNick(serverID, discordId);
  if (!nick) return null;
  return Character.findOne({ where: { name: nick, guildID: serverID } });
}

// Mirrors CharacterController::save() in the PHP site.
export async function saveCharacter(
  serverID: string,
  characterID: number,
  name: string,
  characterClass: string,
  role: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.discordId) {
    return { error: "Not signed in." };
  }

  name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  const nick = await getNick(serverID, session.discordId);
  const main = await getMain(serverID, session.discordId);

  // If the player has no main yet and set a name other than their current
  // nickname, sync it to Discord -- matches the PHP behavior exactly.
  if (name !== nick && !characterID && !main) {
    const result = await setGuildMemberNickname(serverID, session.discordId, name);
    if ("code" in result && result.code === 50013) {
      return {
        error:
          'The bot could not automatically change your name due to permissions issues. It must have a higher role than the person it is trying to change, and it can never change the nickname of an administrator. Please fix the permission issue, or manually change your name to "' +
          name +
          '" and try again.',
      };
    }
  }

  if (!name || !characterClass || !role) {
    return { error: "Name, class, and role are all required." };
  }

  if (!characterID) {
    const existing = await Character.findOne({ where: { name, guildID: serverID } });
    if (existing) {
      existing.class = characterClass;
      existing.role = role;
      existing.mainID = main ? String(main.id) : existing.mainID;
      await existing.save();
    } else {
      await Character.create({
        name,
        class: characterClass,
        role,
        guildID: serverID,
        memberID: session.discordId,
        mainID: main ? String(main.id) : null,
      });
    }
  } else {
    await Character.update(
      { name, class: characterClass, role, memberID: session.discordId },
      { where: { id: characterID } }
    );
  }

  revalidatePath(`/characters/${serverID}`);
  return {};
}
