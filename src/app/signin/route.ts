import type { NextRequest } from "next/server";
import { signIn } from "@/auth";

// Auth.js v5 doesn't support a plain GET to /api/auth/signin/discord --
// that always throws UnknownAction (provider sign-in requires POST + CSRF,
// which is what the built-in signIn() helper handles internally). This
// route lets proxy.ts redirect unauthenticated visitors straight into the
// Discord OAuth flow with a single hop instead of landing on the default
// multi-provider sign-in page.
export async function GET(request: NextRequest) {
  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl") ?? "/";
  await signIn("discord", { redirectTo: callbackUrl });
}
