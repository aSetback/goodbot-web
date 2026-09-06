import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

async function refreshDiscordAccessToken(refreshToken: string) {
  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_DISCORD_ID!,
      client_secret: process.env.AUTH_DISCORD_SECRET!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const tokens = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to refresh Discord token: ${JSON.stringify(tokens)}`);
  }

  return {
    accessToken: tokens.access_token as string,
    accessTokenExpiresAt: Math.floor(Date.now() / 1000) + (tokens.expires_in as number),
    refreshToken: (tokens.refresh_token as string | undefined) ?? refreshToken,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      // "guilds" matches the scope the existing PHP site requests -- pages
      // that need a member's guild list call Discord's API on demand with
      // the access token below, rather than caching guilds in the session.
      authorization: { params: { scope: "identify guilds" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        // Fresh sign-in: Discord's OAuth access tokens expire (~7 days) --
        // stash the refresh token and expiry alongside it so later requests
        // can renew it instead of quietly failing once it goes stale.
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpiresAt = account.expires_at;
        token.discordId = account.providerAccountId;
        delete token.error;
        return token;
      }

      // Still valid (with a minute of slack for clock skew / in-flight requests).
      if (
        typeof token.accessTokenExpiresAt === "number" &&
        Date.now() < token.accessTokenExpiresAt * 1000 - 60_000
      ) {
        return token;
      }

      if (!token.refreshToken) {
        return token;
      }

      try {
        const refreshed = await refreshDiscordAccessToken(token.refreshToken as string);
        token.accessToken = refreshed.accessToken;
        token.accessTokenExpiresAt = refreshed.accessTokenExpiresAt;
        token.refreshToken = refreshed.refreshToken;
        delete token.error;
      } catch (error) {
        console.error("Failed to refresh Discord access token", error);
        // Surfaced on the session so pages/proxy can force a fresh sign-in
        // instead of making Discord API calls with a dead token.
        token.error = "RefreshAccessTokenError";
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.discordId = token.discordId as string;
      session.error = token.error as string | undefined;
      return session;
    },
  },
});
