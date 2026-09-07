import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserGuilds, isGuildAdmin, searchGuildMembers } from "@/lib/discord";

// Backs the raid-leader autocomplete on the raid settings page -- searches
// a guild's members by name, keeping the bot token server-side.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const { guildId } = await params;
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const guilds = await getUserGuilds(session.accessToken);
  if (!guilds.some((guild) => guild.id === guildId && isGuildAdmin(guild))) {
    return NextResponse.json({ error: "Not authorized for this server." }, { status: 403 });
  }

  const query = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchGuildMembers(guildId, query);
  return NextResponse.json(results);
}
