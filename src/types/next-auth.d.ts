export {};

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    discordId?: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    discordId?: string;
    error?: string;
  }
}
