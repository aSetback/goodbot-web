import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Mirrors the PHP site's route groups: routes/web.php wraps almost
// everything in `middleware oauth` and only carves out a handful of public
// routes (plus the /dashboard/admin key-gated ops page, which checks its own
// secret and doesn't need OAuth). Because the PHP app's fallback route
// (`Route::get('{raid}', ...)`) is *inside* the oauth group, the default
// here has to be "protected" too -- an allowlist of prefixes would silently
// leave new top-level pages (and the [hash] catch-all) unprotected.
const PUBLIC_PREFIXES = ["/api/auth", "/signin", "/dashboard/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  // Static files served out of /public (images, etc.) aren't routes at all
  // in the PHP app, so they were never behind oauth -- match them by file
  // extension rather than hardcoding every public/ subdirectory.
  const isStaticAsset = /\.[a-zA-Z0-9]+$/.test(pathname);
  const isPublic =
    pathname === "/" ||
    isStaticAsset ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  // A session can exist (req.auth truthy) with a Discord access token that
  // failed to refresh -- e.g. the user revoked the app's Discord
  // authorization. Treat that the same as not being signed in rather than
  // letting every Discord-API-backed page crash trying to use it.
  const needsReauth = !req.auth || req.auth.error === "RefreshAccessTokenError";
  if (!isPublic && needsReauth) {
    const signInUrl = new URL("/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
