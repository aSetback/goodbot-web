// Matches functions/embed.js in the GoodBot bot repo: the soft-reserve link
// embeds base64url(raidID:memberID) instead of a bare raid ID. Not real
// access control (base64 isn't encryption) -- just deters casually paging
// through sequential raid IDs. See commit e049f21 in the bot repo.
export function encodeReserveToken(raidID: number | string, memberID: string): string {
  return Buffer.from(`${raidID}:${memberID}`, "utf8").toString("base64url");
}

export function decodeReserveToken(token: string): { raidID: string; memberID: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator === -1) return null;
    return {
      raidID: decoded.slice(0, separator),
      memberID: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}
