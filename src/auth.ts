import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

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
        token.accessToken = account.access_token;
        token.discordId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.discordId = token.discordId as string;
      return session;
    },
  },
});
