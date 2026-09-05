import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Mirrors the PHP site's route groups: everything except the landing page
// sits behind Discord OAuth (routes/web.php wraps these in `middleware
// oauth`). Add new protected prefixes here as pages get ported.
const PROTECTED_PREFIXES = ["/r/", "/s/", "/dashboard", "/raids", "/characters"];

export default auth((req) => {
  const isProtected = PROTECTED_PREFIXES.some((prefix) => req.nextUrl.pathname.startsWith(prefix));
  if (isProtected && !req.auth) {
    const signInUrl = new URL("/api/auth/signin/discord", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
